import { Button, StepperButton } from "@/components/common/Buttons";
import { Input } from "@/components/common/Inputs";
import OptimizedDropDown from "@/components/common/OptimizedDropDown";
import { useAppContext } from "@/context/AppContext";
import { getLogoName } from "@/helpers/helper";
import { notificationService } from "@/services/notificationService";
import { Comment, CommentRequest, TaggableUsers } from "@/types/inpection";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CommentSkeleton } from "../common/CommentSkeleton";
import { StepperButtons } from "@/types/button";

type CommentAction = {
  type: "reply" | "edit" | "delete" | "more" | null;
  commentId: string | null;
};

const ViewComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [tags, setTags] = useState<TaggableUsers[]>([]);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );
  const { inspectionId, notifications } = useAppContext();
  const [activeAction, setActiveAction] = useState<CommentAction>({
    type: null,
    commentId: null,
  });
  const [inputValues, setInputValues] = useState({
    comment: "",
    reply: new Map<string, string>(),
    edit: new Map<string, string>(),
  });
  const [isLoading, setIsLoading] = useState({
    getComment: false,
    addComment: false,
    addReply: false,
    editComment: false,
  });
  const [buttons, setButtons] = useState<StepperButtons>({
    cancel: {
      loading: false,
      disabled: false,
      label: "Cancel",
      name: "cancel",
    },
    submit: {
      loading: isLoading.addReply,
      disabled: false,
      label: "Reply",
      name: "submit",
    },
  });
  const [showTagsFor, setShowTagsFor] = useState<
    "comment" | "reply" | "edit" | null
  >(null);

  // Form options state
  const getFormOptions = (value: string) => {
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex === -1) return [];

    const searchQuery = value
      .substring(lastAtIndex + 1)
      .trim()
      .toLowerCase();
    return tags
      .filter((tag) => tag.displayName.toLowerCase().includes(searchQuery))
      .map((tag) => ({
        label: tag.displayName,
        value: tag.id,
        name: tag.displayName,
      }));
  };

  const [formOptions, setFormOptions] = useState({
    comment: getFormOptions(""),
    reply: getFormOptions(""),
    edit: getFormOptions(""),
  });

  // Handlers
  const handleInputChange = (
    type: "comment" | "reply" | "edit",
    value: string,
    commentId?: string
  ) => {
    if (type === "comment") {
      setInputValues((prev) => ({
        ...prev,
        comment: value,
      }));
    }

    if ((type === "reply" || type === "edit") && commentId) {
      setInputValues((prev) => ({
        ...prev,
        [type]: new Map(prev[type]).set(commentId, value),
      }));
    }

    // Handle tag suggestions
    const lastWord = value.split(/\s/).pop();
    if (lastWord?.startsWith("@") || value.endsWith("@")) {
      setShowTagsFor(type);
      setFormOptions((prev) => ({
        ...prev,
        [type]: getFormOptions(value),
      }));
    } else {
      setShowTagsFor(null);
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleTagSelection = (
    type: "comment" | "reply" | "edit",
    key: string
  ) => {
    const value =
      type === "comment"
        ? inputValues.comment
        : inputValues[type].get(activeAction.commentId || "") || "";
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex === -1) return;

    const beforeAt = value.substring(0, lastAtIndex + 1);
    const newValue = `${beforeAt}${key} `;

    if (type === "comment") {
      setInputValues((prev) => ({ ...prev, comment: newValue }));
    } else {
      setInputValues((prev) => ({
        ...prev,
        [type]: new Map(prev[type]).set(activeAction.commentId || "", newValue),
      }));
    }
    setShowTagsFor(null);
  };

  const extractMentions = (content: string) => {
    const mentionRegex = /@([\w\s]+)/g;
    const mentionedIds = new Set<string>();
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      const mentionedName = match[1].trim();
      const taggedUser = tags.find((tag) => tag.displayName === mentionedName);
      if (taggedUser) {
        mentionedIds.add(taggedUser.id);
      }
    }
    return Array.from(mentionedIds);
  };

  const handleCommentSubmit = async () => {
    if (!inputValues.comment.trim() || !inspectionId) return;

    const mentionedIds = extractMentions(inputValues.comment);

    setIsLoading((prev) => ({ ...prev, addComment: true }));
    try {
      await notificationService.createComment(inspectionId, {
        content: inputValues.comment,
        recipientIds: Array.from(mentionedIds),
        parentId: null,
      });

      const response = await notificationService.getAllComments(inspectionId);
      setComments(response.data || []);
      setInputValues((prev) => ({ ...prev, comment: "" }));
      setShowTagsFor(null);
    } finally {
      setIsLoading((prev) => ({ ...prev, addComment: false }));
    }
  };

  const handleReply = async (parentId: string) => {
    const replyContent = inputValues.reply.get(parentId);
    if (!replyContent?.trim() || !inspectionId) return;

    const mentionedIds = extractMentions(replyContent);
    const recipientIds = new Set(mentionedIds);

    // Find and add the parent comment author's ID
    const findParentComment = (
      comments: Comment[],
      id: string
    ): Comment | undefined => {
      for (const comment of comments) {
        if (comment.id === id) return comment;
        if (comment.replies) {
          const found = findParentComment(comment.replies, id);
          if (found) return found;
        }
      }
      return undefined;
    };

    const parentComment = findParentComment(comments, parentId);
    if (parentComment) {
      const parentAuthor = tags.find(
        (tag) => tag.displayName === parentComment.authorName
      );
      if (parentAuthor) {
        recipientIds.add(parentAuthor.id);
      }
    }

    setIsLoading((prev) => ({ ...prev, addReply: true }));
    try {
      await notificationService.createComment(inspectionId, {
        content: replyContent,
        parentId,
        recipientIds: Array.from(recipientIds),
      });

      const response = await notificationService.getAllComments(inspectionId);
      setComments(response.data || []);
      setInputValues((prev) => ({
        ...prev,
        reply: new Map(prev.reply).set(parentId, ""),
      }));
      setActiveAction({ type: null, commentId: null });
    } finally {
      setIsLoading((prev) => ({ ...prev, addReply: false }));
    }
  };

  const handleEdit = async (comment: Comment) => {
    setIsLoading((prev) => ({ ...prev, editComment: true }));

    const editContent = inputValues.edit.get(comment.id) || comment.content;
    const mentionedIds = extractMentions(editContent);

    // Create a Set for unique recipient IDs
    const recipientIds = new Set(mentionedIds);

    // If this is a reply, add the parent comment author's ID
    if (comment.parentId && comment.parentId !== "null") {
      const findParentComment = (
        comments: Comment[],
        id: string
      ): Comment | undefined => {
        for (const c of comments) {
          if (c.id === id) return c;
          if (c.replies) {
            const found = findParentComment(c.replies, id);
            if (found) return found;
          }
        }
        return undefined;
      };

      const parentComment = findParentComment(comments, comment.parentId);
      if (parentComment) {
        const parentAuthor = tags.find(
          (tag) => tag.displayName === parentComment.authorName
        );
        if (parentAuthor) {
          recipientIds.add(parentAuthor.id);
        }
      }
    }

    const updatedComment: CommentRequest = {
      content: editContent,
      recipientIds: Array.from(recipientIds),
      id: comment.id,
      parentId: comment.parentId !== "null" ? comment.parentId : undefined,
    };

    try {
      await notificationService.updateComment(updatedComment);
      const response = await notificationService.getAllComments(inspectionId);
      setComments(response.data || []);
      setInputValues((prev) => ({
        ...prev,
        edit: new Map(prev.edit).set(comment.id, ""),
      }));
      setActiveAction({ type: null, commentId: null });
    } finally {
      setIsLoading((prev) => ({ ...prev, editComment: false }));
    }
  };

  const handleDelete = async (commentId: string) => {
    await notificationService.deleteComment(commentId);
    const response = await notificationService.getAllComments(inspectionId);
    setComments(response.data || []);
    setActiveAction({ type: null, commentId: null });
  };

  const handleMoreOption = (key: string, id: string) => {
    if (key === "delete") {
      handleDelete(id);
    } else if (key === "edit") {
      const findComment = (
        comments: Comment[],
        commentId: string
      ): Comment | undefined => {
        for (const comment of comments) {
          if (comment.id === commentId) return comment;
          if (comment.replies) {
            const found = findComment(comment.replies, commentId);
            if (found) return found;
          }
        }
        return undefined;
      };

      const targetComment = findComment(comments, id);
      if (targetComment) {
        const newInputValues = {
          ...inputValues,
          edit: new Map(inputValues.edit).set(id, targetComment.content),
        };

        // Set both states together to avoid race conditions
        Promise.resolve().then(() => {
          setInputValues(newInputValues);
          setActiveAction({ type: "edit", commentId: id });
        });
      }
    }
  };

  const fetchData = async () => {
    if (inspectionId) {
      setIsLoading((prev) => ({ ...prev, getComment: true }));
      try {
        const [commentsResponse, tagsResponse] = await Promise.all([
          notificationService.getAllComments(inspectionId),
          notificationService.getAllTaggableUsers(),
        ]);
        setComments(commentsResponse.data || []);
        setTags(tagsResponse.data);
      } finally {
        setIsLoading((prev) => ({ ...prev, getComment: false }));
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [notifications.unreadCount]);

  // Render helpers
  const renderCommentActions = (comment: Comment) => {
    return (
      <div className="flex gap-2 text-xs mt-2">
        <span
          className="text-xs text-azure cursor-pointer"
          onClick={() =>
            setActiveAction({ type: "reply", commentId: comment.id })
          }
        >
          Reply
        </span>
        {comment.replyCount > 0 && (
          <span
            className="flex items-center gap-1 text-azure cursor-pointer"
            onClick={() => toggleReplies(comment.id)}
          >
            <Image
              src="/images/message.svg"
              width={18}
              height={18}
              alt="comments"
            />
            {comment.replyCount}
            <span className="ml-1">
              {expandedComments.has(comment.id) && "Hide"}
            </span>
          </span>
        )}
        <div className="relative">
          <Image
            src="/images/action-menu-icon.svg"
            width={18}
            height={10}
            alt="more"
            className="cursor-pointer"
            onClick={() =>
              setActiveAction((prev) => ({
                type:
                  prev.type === "more" && prev.commentId === comment.id
                    ? null
                    : "more",
                commentId:
                  prev.type === "more" && prev.commentId === comment.id
                    ? null
                    : comment.id,
              }))
            }
          />
          {activeAction.type === "more" &&
            activeAction.commentId === comment.id &&
            activeAction.commentId === comment.id && (
              <OptimizedDropDown
                options={[
                  {
                    label: "Edit",
                    value: "edit",
                    icon: "edit.svg",
                    name: "edit",
                  },
                  {
                    label: "Delete",
                    value: "delete",
                    icon: "delete-icon.svg",
                    name: "delete",
                  },
                ]}
                show={true}
                setShow={() => setActiveAction({ type: null, commentId: null })}
                onChange={(key) => handleMoreOption(key, comment.id)}
              />
            )}
        </div>
      </div>
    );
  };

  const RenderReply = ({
    reply,
    level = 0,
  }: {
    reply: Comment;
    level?: number;
  }) => {
    return (
      <div className="flex gap-2 relative w-full">
        <div className="absolute top-0 left-0 sm:left-4 h-full w-px bg-gray-300" />
        <div className="flex flex-col gap-1 ml-6 w-full">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex w-10 h-10 justify-center items-center font-semibold text-regentGrey bg-ghostWhite rounded-2xl">
              {getLogoName(reply.authorName)}
            </div>
            <div className="flex flex-col">
              <span className="text-base font-medium">{reply.authorName}</span>
              <span className="text-xs text-liver">
                {reply.relativeTime}
              </span>
            </div>
          </div>

          {activeAction.type === "edit" &&
          activeAction.commentId === reply.id ? (
            <div className="lg:w-11/12 2xl:w-full flex flex-col sm:flex-row gap-4 sm:items-center relative sm:ml-14">
              <div className="sm:w-11/12">
                <Input
                  props={{
                    name: "edit",
                    value: inputValues.edit.get(reply.id) || reply.content,
                    placeholder: "Edit reply",
                    label: "",
                  }}
                  onChange={(_, value) =>
                    handleInputChange("edit", value, reply.id)
                  }
                />
                {showTagsFor === "edit" && (
                  <OptimizedDropDown
                    options={formOptions.edit}
                    show={true}
                    setShow={() => setShowTagsFor(null)}
                    onChange={(key) => handleTagSelection("edit", key)}
                  />
                )}
              </div>
              <div className="flex w-fit gap-4">
                {buttons.cancel && buttons.submit && (
                  <>
                    <StepperButton
                      onClick={() =>
                        setActiveAction({ type: null, commentId: null })
                      }
                      data={buttons.cancel}
                    />
                    <StepperButton
                      onClick={() => handleEdit(reply)}
                      data={{
                        ...buttons.submit,
                        label: "Update",
                        loading: isLoading.editComment,
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="font-normal text-sm text-liver sm:pl-14 mt-2 sm:mt-4 relative">
              <div className="absolute top-3 left-0 w-2 sm:w-8 border-t border-gray-300" />
              {reply.content.split(/(@\w+(?:\s\w+)?)/g).map((part, i) =>
                part.startsWith("@") ? (
                  <span key={i} className="text-azure font-semibold">
                    {part}
                  </span>
                ) : (
                  part
                )
              )}
            </div>
          )}

          {renderCommentActions(reply)}

          {activeAction.type === "reply" &&
            activeAction.commentId === reply.id && (
              <div className="relative mt-2 ml-0 sm:ml-14 lg:w-4/5 2xl:w-full">
                <span className="text-xs text-liver">
                  Replying to {reply.authorName}
                </span>
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <div className="w-full sm:w-11/12">
                    <Input
                      props={{
                        name: "reply",
                        placeholder: "Add reply",
                        value: inputValues.reply.get(reply.id),
                        label: "",
                      }}
                      onChange={(_, value) =>
                        handleInputChange("reply", value, reply.id)
                      }
                    />
                    {showTagsFor === "reply" && (
                      <OptimizedDropDown
                        options={formOptions.reply}
                        show={true}
                        setShow={() => setShowTagsFor(null)}
                        onChange={(key) => handleTagSelection("reply", key)}
                      />
                    )}
                  </div>
                  <div className="flex w-fit gap-4">
                    {buttons.submit && buttons.cancel && (
                      <>
                        <StepperButton
                          onClick={() =>
                            setActiveAction({ type: null, commentId: null })
                          }
                          data={buttons.cancel}
                        />
                        <StepperButton
                          onClick={() => handleReply(reply.id)}
                          data={{
                            ...buttons.submit,
                            loading: isLoading.addReply,
                          }}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Recursively render nested replies */}
          {reply.replies &&
            reply.replies.length > 0 &&
            expandedComments.has(reply.id) && (
              <div
                className={`ml-${Math.min(
                  level + 8,
                  16
                )} mt-4 flex flex-col gap-2`}
              >
                {reply.replies.map((nestedReply) => (
                  <RenderReply
                    key={nestedReply.id}
                    reply={nestedReply}
                    level={level + 1}
                  />
                ))}
              </div>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 border border-platinum rounded-2xl p-4">
      {/* add comment input on top */}
      <div className="w-full flex flex-col sm:flex-row gap-0 sm:gap-4 items-center sticky top-0 bg-snow z-50">
        <div className="w-full sm:w-9/10 relative">
          <Input
            props={{
              name: "Comment",
              placeholder: "Add Comment",
              value: inputValues.comment,
              label: "",
            }}
            onChange={(name, value) => {
              handleInputChange("comment", value);
              const lastWord = value.split(/\s/).pop();
              if (lastWord?.startsWith("@") || value.endsWith("@")) {
                setShowTagsFor("comment");
              } else {
                setShowTagsFor(null);
              }
            }}
          />
          {showTagsFor === "comment" && (
            <OptimizedDropDown
              options={formOptions.comment}
              show={true}
              setShow={() => setShowTagsFor(null)}
              onChange={(key) => handleTagSelection("comment", key)}
            />
          )}
        </div>
        <div className="w-full sm:w-2/12">
          <Button
            name="Submit"
            disabled={!inputValues.comment.trim()}
            loading={isLoading.addComment}
            onClick={() => handleCommentSubmit()}
          />
        </div>
      </div>

      <span className="font-medium"> Comments</span>
      <div className="h-full w-full overflow-y-scroll custom-scrollbar">
        <div className="">
          {isLoading.getComment ? (
            <>
              <CommentSkeleton />
              <CommentSkeleton />
            </>
          ) : (
            comments.map((item, index) => (
              <div
                className="flex gap-4 bg sm:py-2 relative w-full"
                key={index}
              >
                <div className="h-24">
                  <div className="w-11.25 min-w-11.25 h-11.25 flex justify-center items-center font-semibold text-regentGrey bg-ghostWhite rounded-2xl">
                    {" "}
                    {getLogoName(item.authorName)}
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full pr-4">
                  <div className="flex flex-col">
                    <span className="text-base font-medium">
                      {item.authorName}
                    </span>
                    <span className="text-xs text-liver">
                      {item.relativeTime}
                    </span>
                  </div>

                  {/* Edit input for the entered comment */}
                  {activeAction.type === "edit" &&
                  activeAction.commentId === item.id ? (
                    <div className="w-full flex flex-col sm:flex-row gap-4 items-center relative">
                      <div className="w-full">
                        <Input
                          props={{
                            name: "edit",
                            value: inputValues.edit.get(item.id),
                            placeholder: "Edit comment",
                            label: "",
                          }}
                          onChange={(_, value) => {
                            handleInputChange("edit", value, item.id);
                          }}
                        />
                        {showTagsFor === "edit" && (
                          <OptimizedDropDown
                            options={formOptions.edit}
                            show={true}
                            setShow={() => setShowTagsFor(null)}
                            onChange={(key) => handleTagSelection("edit", key)}
                          />
                        )}
                      </div>

                      {/* cancel submit button for reply */}

                      <div className="flex w-fit gap-4">
                        {buttons.cancel && (
                          <StepperButton
                            onClick={() =>
                              setActiveAction({ type: null, commentId: null })
                            }
                            data={buttons.cancel}
                          />
                        )}
                        {buttons.submit && (
                          <StepperButton
                            onClick={() => handleEdit(item)}
                            data={{
                              ...buttons.submit,
                              label: "Update",
                              loading: isLoading.editComment,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="font-normal text-sm text-liver mt-2">
                      {item.content
                        .split(/(@\w+(?:\s\w+)?)/g)
                        .map((part, index) =>
                          part.startsWith("@") ? (
                            <span
                              key={index}
                              className="text-azure font-semibold"
                            >
                              {part}
                            </span>
                          ) : (
                            part
                          )
                        )}
                    </div>
                  )}
                  {/* edit, delete, reply options */}
                  {renderCommentActions(item)}

                  {activeAction.type === "reply" &&
                    activeAction.commentId === item.id && (
                      <div className="relative w-full">
                        <span className="text-xs text-liver">
                          Replying to {item.authorName}
                        </span>
                        <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full">
                          <div className="w-full sm:w-11/12">
                            <Input
                              props={{
                                name: "reply",
                                placeholder: "Add reply",
                                value: inputValues.reply.get(item.id),
                                label: "",
                              }}
                              onChange={(_, value) => {
                                handleInputChange("reply", value, item.id);
                              }}
                            />
                            {showTagsFor === "reply" && (
                              <OptimizedDropDown
                                options={formOptions.reply}
                                show={true}
                                setShow={() => setShowTagsFor(null)}
                                onChange={(key) =>
                                  handleTagSelection("reply", key)
                                }
                              />
                            )}
                          </div>
                          <div className="flex w-fit gap-4">
                            {buttons.cancel && (
                              <StepperButton
                                onClick={() => {
                                  setActiveAction({
                                    type: null,
                                    commentId: null,
                                  });
                                  setInputValues((prev) => ({
                                    ...prev,
                                    reply: new Map(),
                                  }));
                                }}
                                data={buttons.cancel}
                              />
                            )}
                            {buttons.submit && (
                              <StepperButton
                                onClick={() => handleReply(item.id)}
                                data={{
                                  ...buttons.submit,
                                  loading: isLoading.addReply,
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  <div className="sm:ml-8 mt-4 flex flex-col gap-3 w-11/12">
                    {item.replies &&
                      item.replies.length > 0 &&
                      expandedComments.has(item.id) &&
                      item.replies.map((reply) => (
                        <RenderReply key={reply.id} reply={reply} />
                      ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewComments;
