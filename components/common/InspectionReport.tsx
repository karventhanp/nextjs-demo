import {
  Page,
  View,
  Text,
  StyleSheet,
  Image,
  Document,
} from "@react-pdf/renderer";
import { getValidUrl } from "@/helpers/helper";
import { HeaderProps, FooterProps } from "@/types/service";
import { Font } from "@react-pdf/renderer";
import { formatCustomerName } from "@/helpers/helper";
import { extractDefectImages, groupDefectsByDistance } from "@/helpers/helper";

const styles = StyleSheet.create({
  page: { padding: 20, fontFamily: "Times-Roman", position: "relative" },
  section: { display: "flex", alignItems: "center" },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
    borderBottomStyle: "solid",
    width: 530,
    marginBottom: 3,
  },
  waterMark: {
    position: "absolute",
    width: "50%",
    height: "40%",
    opacity: 0.1,
    top: "30%",
    alignSelf: "center",
  },
  sec: { marginBottom: 10 },
  text: { fontSize: 12 },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    fontSize: 14,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "black",
    borderBottomStyle: "solid",
    paddingBottom: 5,
    paddingLeft: 20,
  },
  multiHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 14,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "black",
    borderBottomStyle: "solid",
    paddingBottom: 5,
  },
  footer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 10,
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    borderTopWidth: 1,
    borderTopColor: "black",
    borderTopStyle: "solid",
    paddingTop: 5,
    zIndex: 0,
  },
  para: {
    textAlign: "justify",
    margin: "0 auto",
    fontSize: 12,
    width: "90%",
    lineHeight: 1.5,
  },
  parahead: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  pipe: {
    position: "absolute",
    left: 80,
    marginTop: 80,
    width: 25,
    height: 600,
    backgroundColor: "#b3d9f5",
    borderLeft: "1px",
    borderRight: "1px",
  },
  pipeCapTop: {
    position: "absolute",
    top: 100,
    left: 78,
    width: 28,
    height: 3,
    borderRadius: 10,
    backgroundColor: "#4da6ff",
  },
  pipeCapBottom: {
    position: "absolute",
    left: 78,
    width: 28,
    height: 3,
    borderRadius: 10,
    backgroundColor: "#4da6ff",
    marginTop: 680,
  },
  box: {
    border: "1px",
    width: 120,
    height: 100,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  boxcontainer: {
    position: "absolute",
    right: 60,
    bottom: 90,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  colorBox: {
    width: 25,
    height: 8,
  },

  legendText: {
    fontSize: 15,
    fontWeight: "bold",
  },
});

const Header = () => (
  <View style={styles.header}>
    <Image style={{ width: 130 }} src="/images/solinas-header.png" />
  </View>
);

const Footer = ({ provider }: FooterProps) => (
  <View style={styles.footer}>
    <Text>Powered By {provider}</Text>
    <Text render={({ pageNumber }) => `Page No:- ${pageNumber}`} />
  </View>
);

const WaterMark = () => (
  <View style={styles.waterMark}>
    <Image src="/images/round-logo.png" cache={true} />
  </View>
);

const MultiDateHeader = ({ startDate, endDate }: HeaderProps) => (
  <View style={styles.multiHeader}>
    <Text style={{ fontSize: 12 }}>
      {startDate.replace(/,/g, "")} - {endDate.replace(/,/g, "")}
    </Text>
    <Image style={{ width: 130 }} src="/images/solinas-header.png" />
  </View>
);

const severityColors: Record<number, string> = {
  1: "#FFD633",
  2: "#FFD633",
  3: "#FF8000",
  4: "#FF8000",
  5: "#F22B0D",
};

Font.registerHyphenationCallback((word) => [word]);

export const InspectionReport = ({
  data,
  userId,
}: {
  data: any;
  userId: string;
}) => {
  const report = data?.data;
  const inspections = report?.inspections || [];
  if (inspections.length <= 1 && !report?.reportMeta?.dateRange?.startDate) {
    const inspection = data.data.inspections[0];
    const tableData = [
      [
        "Location",
        inspection.siteInfo.location,
        "Direction",
        inspection.siteInfo.direction,
      ],
      [
        "Age of pipeline",
        inspection.siteInfo.ageOfPipeline,
        "Type of Pipeline",
        inspection.siteInfo.typeOfPipeline,
      ],
      [
        "Pipeline Material",
        inspection.siteInfo.pipelineMaterial,
        "Pipeline Diameter",
        inspection.siteInfo.pipelineDiameter,
      ],
      [
        "GPS Co-ordinates",
        inspection.siteInfo.gpsCoordinates,
        "Inspection Length",
        inspection.siteInfo.inspectionLength,
      ],
    ];

    const pages = [
      <Page size="A4" style={styles.page} key={1}>
        <View style={styles.section}>
          <View style={styles.border} />
        </View>
        <View>
          <View
            style={{
              textAlign: "right",
              marginTop: 200,
              marginBottom: 120,
              fontSize: 20,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>
              Solinas Integrity Private Ltd.
            </Text>
            <Text>
              {"{Water Pipeline/Manhole and Sewer}"}{" "}
              <Text style={{ fontWeight: "bold" }}>Inspection</Text>
            </Text>
          </View>
          <View style={{ textAlign: "right", marginBottom: 100 }}>
            <Text style={{ fontSize: 16 }}>Prepared for</Text>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              {formatCustomerName(report.reportMeta.preparedFor)}
            </Text>
          </View>
          <View style={{ textAlign: "right", fontSize: 14, marginBottom: 80 }}>
            <Text style={{ marginBottom: 2 }}>{report.reportMeta.address}</Text>
            <Text>
              <Text> {report.reportMeta.inspectionDate.replace(/,/g, "")}</Text>
            </Text>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              marginBottom: 10,
              marginTop: 80,
            }}
          >
            <Image
              style={{ width: 130, height: 20 }}
              src="/images/solinas-header.png"
            />
          </View>
          <View>
            <Text style={{ textAlign: "right", fontSize: 12 }}>
              D305, Solinas Integrity Pvt. Ltd,{"\n"}
              C/O IITM Incubation Cell,{"\n"}
              Kanagam Road, Taramani,{"\n"}
              Chennai - 600113, Tamil Nadu
            </Text>
          </View>
        </View>
      </Page>,

      <Page style={styles.page} key={2}>
        <Header />
        <WaterMark />
        <View style={styles.parahead}>
          <Text style={{ marginTop: 10 }}>NOTICE</Text>
        </View>
        <View style={{ marginTop: 10 }}>
          <Text style={styles.para}>
            The information contained in this report is provided for
            interpretation by a suitably qualified civil engineering
            professional engaged by the Client presented. This report is not
            intended and must not be taken as professional civil engineering
            advice, nor shall it be relied upon as a substitute for professional
            civil engineering advice. Interpretation of this report, evaluation
            of the pipelines, and any rehabilitation, investigative, cleaning,
            or other decisions are the sole responsibility of the Client.
            Certain information contained in this report such as distances and
            dimensions may incorporate information provided by others. The
            information may not always be accurate and complete. The engineer
            should make their own assessments regarding such information. The
            information contained in this document may be confidential. It is
            intended only for the use of the Client. However, any disclosure,
            reproduction, distribution, or other dissemination or use of the
            information contained in this document is not to be done to other
            parties without the written consent of Solinas Integrity Private
            Limited.
          </Text>
        </View>
        <View style={styles.parahead}>
          <Text style={{ marginTop: 15 }}>EXECUTIVE SUMMARY</Text>
        </View>
        <View style={styles.para}>
          <Text style={{ marginBottom: 10 }}>
            Solinas Inspection Service provides pipeline solution that comes
            with the dashboard that helps tracking, maintaining, and analysing
            the information. It has features that helps in planning for the
            inspections (Inspection Management), tracking the status of the
            issue (resolved/unresolved), generating reports for any given period
            and Geographic Information System which helps us in visualising the
            overall problem.
          </Text>
          <Text style={{ marginBottom: 10 }}>
            Our solution is used for internal condition assessment and defect
            detection in pipelines that characterizes and pinpoints the location
            of defects along with analytics so that asset managers can take
            preventive maintenance actions thereby reducing losses. We detect
            critical defects leading to the pipeline leakage and perform overall
            internal condition assessment to identify wall defects,
            encrustations and unidentified objects and their locations, for
            corresponding corrective actions to be taken at specified sections
            of pipeline minimal digging of the roads.
          </Text>
          <Text style={{ marginBottom: 10 }}>
            We would like to thank{" "}
            <Text style={{ fontWeight: "bold" }}>
              {" "}
              {formatCustomerName(report.reportMeta.preparedFor)}{" "}
            </Text>
            for its unconditional support. We would like to thank the various
            staff for their continued assistance during the various phases of
            the inspection work, without your support such a challenging work
            could not have been possible.
          </Text>
        </View>
        <View style={styles.parahead}>
          <Text>INSPECTION PROCEDURE</Text>
        </View>
        <View style={styles.para}>
          <Text>
            <Text style={{ fontWeight: "bold" }}>
              Pre-inspection – site preparation:
            </Text>{" "}
            Access point in the pipeline is opened and the pipelines are
            dewatered. Equipment and tools were transported to the site location
            to perform the inspection with the help of{" "}
            <Text style={{ fontWeight: "bold" }}>
              {formatCustomerName(report.reportMeta.preparedFor)}
            </Text>
            . Considering the sizes of the pipeline and the space available for
            insertion of the tools, cameras were chosen to perform the inline
            video inspection. Safety precautions were taken after thorough
            preliminary study of the subject to perform the inspection safely.
          </Text>
        </View>
        <Footer provider={report.poweredBy} />
      </Page>,

      <Page style={styles.page} key={3}>
        <Header />
        <WaterMark />
        <View style={[styles.para, { marginTop: 10 }]}>
          <Text>
            <Text style={{ fontWeight: "bold" }}>
              Installation of inspection equipment:
            </Text>{" "}
            Once the site was prepared for inspection, it was handed over to
            Solinas team for installing the inspection equipment.
          </Text>
        </View>
        <View
          style={{
            textAlign: "left",
            fontSize: 12,
            width: "90%",
            margin: "0 auto",
            marginBottom: 5,
          }}
        >
          <Text>Inspection Equipment:</Text>
        </View>
        <View
          style={{
            fontSize: 12,
            textAlign: "justify",
            width: "90%",
            margin: "0 auto",
            lineHeight: 1.5,
            padding: 15,
          }}
        >
          <Text>• Video Cameras with DVR</Text>
          <Text>• Endobot/Endoscopy and Other Mechanical Tools</Text>
          <Text>• Personal Protective Equipment (PPE)</Text>
        </View>
        <View style={styles.para}>
          <Text>
            <Text style={{ fontWeight: "bold" }}>Inspection:</Text> The
            Endobot/endoscopy was inserted into the pipeline through an opening,
            remotely controlled with the help of a tether. The equipment was
            driven inside the pipeline through controlled manual feed or remote
            in case of Endobot. The live video feed from the camera is obtained
            at the base station. The feedback is used to identify and locate the
            critical spots in the pipeline. The locations of the defects were
            recorded and this data is provided immediately for precise
            localization of the defects/features identified.
          </Text>
        </View>

        {Array.isArray(inspection?.keyRecommendations) &&
          inspection.keyRecommendations.length > 0 && (
            <>
              <View style={styles.parahead}>
                <Text>KEY RECOMMENDATIONS:</Text>
              </View>
              <View
                style={{
                  fontSize: 12,
                  width: "90%",
                  lineHeight: 1.5,
                  margin: "0 auto",
                  padding: 10,
                }}
              >
                {inspection.keyRecommendations.map(
                  (rec: any, index: number) => (
                    <Text key={index}>• {rec?.description?.trim()}</Text>
                  )
                )}
              </View>
            </>
          )}

        <View style={styles.parahead}>
          <Text>Pipeline Grading</Text>
        </View>
        <View style={styles.para}>
          <Text>
            Pipeline grading refers to the process of evaluating and rating the
            condition of a pipeline, usually for the purpose of determining its
            integrity and remaining service life. It depends on the type and age
            of the pipeline, the material it is made of, and the purpose of the
            inspection. Once the internal conditional assessment is performed
            using Endobot, the severity grade for each defect is mapped using
            the bellow mentioned parameters (refer the table) and the results
            are used to assess the overall condition of the pipeline and
            determine any necessary repairs or maintenance.
          </Text>
        </View>
        <View
          style={{
            textAlign: "center",
            margin: "0 auto",
            width: "90%",
            marginTop: 15,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              borderWidth: 1,
              borderColor: "black",
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 12,
                fontWeight: "bold",
                padding: 5,
                borderRightWidth: 1,
                borderColor: "black",
              }}
            >
              Severity Grade
            </Text>
            <Text
              style={{
                flex: 2,
                fontSize: 12,
                fontWeight: "bold",
                padding: 5,
                borderRightWidth: 1,
                borderColor: "black",
              }}
            >
              Description of Condition
            </Text>
            <Text
              style={{ flex: 3, fontSize: 12, fontWeight: "bold", padding: 5 }}
            >
              Estimated Time to Failure
            </Text>
          </View>
          {[
            [
              "1",
              "Pipe segment has minor defects",
              "Failure unlikely in the foreseeable future",
            ],
            [
              "2",
              "Pipe segment has minor defects",
              "Pipe unlikely to fail for at least 7 years",
            ],
            [
              "3",
              "Pipe segment has moderate defects",
              "Deterioration may continue, at 3–5-year timeframe",
            ],
            [
              "4",
              "Pipe segment has severe defects",
              "Risk of failure within the next 2 years",
            ],
            [
              "5",
              "Requires immediate attention",
              "Pipe segment has failed/will likely fail immediately",
            ],
          ].map((row, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                borderWidth: 1,
                borderColor: "black",
                borderTopWidth: 0,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  fontSize: 11,
                  padding: 5,
                  borderRightWidth: 1,
                  borderColor: "black",
                  textAlign: "center",
                }}
              >
                {row[0]}
              </Text>
              <Text
                style={{
                  flex: 2,
                  fontSize: 11,
                  padding: 5,
                  borderRightWidth: 1,
                  borderColor: "black",
                  textAlign: "left",
                }}
              >
                {row[1]}
              </Text>
              <Text
                style={{ flex: 3, fontSize: 11, padding: 4, textAlign: "left" }}
              >
                {row[2]}
              </Text>
            </View>
          ))}
        </View>
        <Footer provider={report.poweredBy} />
      </Page>,

      <Page style={styles.page} key={4}>
        <Header />
        <WaterMark />
        <View style={styles.parahead}>
          <Text style={{ marginTop: 15 }}>Risk Analysis</Text>
        </View>
        <View style={styles.para}>
          <Text style={{ marginBottom: 10 }}>
            Risk analysis is done to each section of pipeline being inspected;
            it is done with the help of the below mentioned matrix. Initially
            with all the defects and the condition of the pipeline the
            probability of failure is calculated.
            <Text style={{ fontWeight: "bold" }}>
              Probability of failure (POF)
            </Text>{" "}
            refers to the likelihood that a particular component or system will
            fail to perform its intended function. Later, the consequence of the
            failure is calculated.
            <Text style={{ fontWeight: "bold" }}>
              Consequence of failure (COF)
            </Text>{" "}
            refers to the potential impact or outcome of a failure of a
            particular component or system.
          </Text>
        </View>
        <View style={{ width: "90%", margin: "0 auto" }}>
          <Image src="/images/risk-chart.png" />
        </View>
        <View style={styles.para}>
          <Text style={{ marginTop: 15, marginBottom: 15 }}>
            <Text style={{ fontWeight: "bold" }}>Risk rating </Text>
            is a process of evaluating and assigning a numerical or qualitative
            value to the risks associated with a particular component or system.
            It is done her by multiplying the value of POF and COF. It has
            numerical values ranging from 1 to 25.
          </Text>
        </View>
        <View
          style={{
            width: "90%",
            textAlign: "justify",
            paddingLeft: 20,
            fontSize: 12,
            lineHeight: 1.5,
            margin: "0 auto",
            marginBottom: 10,
          }}
        >
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: "bold" }}>High risk (Red):</Text> These
            have a high likelihood of occurring and/or a high potential impact.
            These risks are considered the most significant and may require
            immediate attention or urgent risk management action. Anything equal
            to or above 10 is considered as high risk.
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: "bold" }}> Medium risk (Blue):</Text>{" "}
            These have a moderate likelihood of occurring and/or a moderate
            potential impact. These risks may require some level of risk
            management action, but may not be as urgent as high-risk. Anything
            equal to or above 5 and below 10 is considered as medium risk.
          </Text>
          <Text>
            <Text style={{ fontWeight: "bold" }}>Low risk (White):</Text> These
            have a low likelihood of occurring and/or a low potential impact.
            These risks are considered the least significant and may not require
            immediate risk management action. Anything below 5 is considered as
            low risk.
          </Text>
        </View>
        <View style={styles.para}>
          <Text>
            Overall, the goal of risk analysis in pipelines is to identify and
            assess the potential risks and hazards associated with the pipeline
            and its operation, and to implement strategies to minimize or
            eliminate those risks. This helps ensure the safe and reliable
            operation of the pipeline and protect the personnel and the
            environment.
          </Text>
        </View>
        <Footer provider={report.poweredBy} />
      </Page>,

      <Page style={styles.page} key={5}>
        <Header />
        <WaterMark />
        <View style={styles.parahead}></View>
        <View
          style={{
            width: "90%",
            fontSize: 11,
            margin: "0 auto",
            marginTop: 10,
            marginBottom: 10,
            borderWidth: 1,
            borderStyle: "solid",
          }}
        >
          {tableData.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={{
                flexDirection: "row",
                borderBottomWidth: rowIndex === tableData.length - 1 ? 0 : 1,
              }}
            >
              {row.map((cell, cellIndex) => (
                <Text
                  key={`${rowIndex}-${cellIndex}`}
                  style={{
                    flex: cellIndex % 2 === 0 ? 1 : 1.5,
                    borderRightWidth: cellIndex === row.length - 1 ? 0 : 1,
                    padding: 5,
                    textAlign: cellIndex % 2 === 0 ? "left" : "center",
                    fontWeight: cellIndex % 2 === 0 ? "bold" : "normal",
                  }}
                >
                  {cell}
                </Text>
              ))}
            </View>
          ))}
        </View>
        <View style={styles.parahead}>
          <Text>GIS Mapping</Text>
        </View>
        <View
          style={{
            width: "90%",
            height: "40%",
            margin: "0 auto",
            marginBottom: 10,
            marginTop: 10,
          }}
        >
          <Image
            src={getValidUrl(inspection.gisMapping?.imageUrl, userId) || "NA"}
          />
        </View>
        {(inspection?.riskAssessment?.rating ||
          inspection?.riskAssessment?.category) && (
          <>
            <View style={styles.parahead}>
              <Text>Risk Analysis of this pipeline</Text>
            </View>
            <View style={{ width: "90%", margin: "0 auto" }}>
              <View
                style={{
                  flexDirection: "row",
                  borderWidth: 1,
                  borderColor: "black",
                }}
              >
                <View
                  style={{
                    flex: 1,
                    borderRightWidth: 1,
                    borderColor: "black",
                  }}
                >
                  <Text
                    style={{ padding: 5, fontSize: 11, fontWeight: "bold" }}
                  >
                    Risk Rating
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    borderRightWidth: 1,
                    borderColor: "black",
                  }}
                >
                  <Text
                    style={{ padding: 5, fontSize: 11, textAlign: "center" }}
                  >
                    {inspection.riskAssessment.rating}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    borderRightWidth: 1,
                    borderColor: "black",
                  }}
                >
                  <Text
                    style={{ padding: 5, fontSize: 11, fontWeight: "bold" }}
                  >
                    Risk Category
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ padding: 5, fontSize: 11, textAlign: "center" }}
                  >
                    {inspection.riskAssessment.rating}
                  </Text>
                </View>
              </View>
              {inspection.riskAssessment.description && (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "black",
                    borderTopWidth: 0,
                  }}
                >
                  <Text
                    style={{ padding: 5, fontSize: 11, fontWeight: "bold" }}
                  >
                    Description on Major findings:
                  </Text>
                  <Text style={{ padding: 5, fontSize: 11 }}>
                    {inspection.riskAssessment.description}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
        <Footer provider={data.data.poweredBy} />
      </Page>,
    ];

    const defectsMeta = data.data?.inspections?.[0]?.defectsMeta?.[0];
    const defectImages = defectsMeta?.defectsImages || [];

    const defectPages = (() => {
      const singleDefectQueue: any[] = [];
      const pages: any[] = [];

      const renderDefectBlock = (imgData: any, defectNo: number) => {
        const description = imgData.description ?? "No description";
        return (
          <>
            <View
              style={{
                fontSize: 12,
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: 5,
              }}
            >
              <Text style={{ marginTop: 5 }}>Defect - {defectNo}</Text>
            </View>
            <View
              style={{
                width: "90%",
                height: "30%",
                margin: "0 auto",
                marginBottom: 10,
              }}
            >
              <Image
                src={getValidUrl(
                  imgData.imageUrl,
                  userId ?? "No image available"
                )}
              />
            </View>
            {imgData.defects?.map((defect: any, defectIndex: number) => {
              const distance = defect.distance ?? "N/A";
              const code = defect.defect?.code ?? "N/A";
              const severity = defect.defect?.severity ?? "N/A";
              return (
                <View key={`defect-${defectIndex}`}>
                  <View
                    style={{
                      width: "90%",
                      borderTop: defectIndex === 0 ? "1px solid black" : "none",
                      borderLeft: "1px solid black",
                      borderRight: "1px solid black",
                      margin: "0 auto",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        fontSize: 11,
                        textAlign: "center",
                        borderBottom:
                          defectIndex === imgData.defects?.length
                            ? "none"
                            : "1px solid black",
                      }}
                    >
                      <Text
                        style={{
                          flex: 1,
                          borderRight: "1px solid black",
                          fontWeight: "bold",
                        }}
                      >
                        Distance
                      </Text>
                      <Text style={{ flex: 1, borderRight: "1px solid black" }}>
                        {distance ?? "-"}
                      </Text>
                      <Text
                        style={{
                          flex: 2,
                          borderRight: "1px solid black",
                          fontWeight: "bold",
                        }}
                      >
                        Defect Code
                      </Text>
                      <Text style={{ flex: 1, borderRight: "1px solid black" }}>
                        {code ?? "-"}
                      </Text>
                      <Text
                        style={{
                          flex: 2,
                          borderRight: "1px solid black",
                          fontWeight: "bold",
                        }}
                      >
                        Severity Grade
                      </Text>
                      <Text style={{ flex: 1 }}>{severity ?? "-"}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
            <View
              style={{
                width: "90%",
                margin: "0 auto",
                fontSize: 11,
                borderWidth: 1,
                borderTopWidth: 0,
              }}
            >
              <Text style={{ padding: 5, fontWeight: "bold" }}>
                Description{"\n"}
              </Text>
              <Text style={{ padding: 5 }}>{description}</Text>
            </View>
          </>
        );
      };

      let defectCounter = 1;
      for (let i = 0; i < defectImages.length; i++) {
        const img = defectImages[i];
        const defectCount = img?.defects?.length || 0;

        if (defectCount > 1) {
          pages.push(
            <Page style={styles.page} key={`multi-defect-${i}`}>
              <Header />
              <WaterMark />
              {renderDefectBlock(img, defectCounter++)}
              <Footer provider={data.data.poweredBy} />
            </Page>
          );
        } else {
          singleDefectQueue.push(img);
        }
      }

      for (let i = 0; i < singleDefectQueue.length; i += 2) {
        const img1 = singleDefectQueue[i];
        const img2 = singleDefectQueue[i + 1];

        pages.push(
          <Page style={styles.page} key={`single-pair-${i}`}>
            <Header />
            <WaterMark />
            {renderDefectBlock(img1, defectCounter++)}
            {img2 && renderDefectBlock(img2, defectCounter++)}
            <Footer provider={report.poweredBy} />
          </Page>
        );
      }
      return pages;
    })();

    const defectsImages = extractDefectImages(inspection);
    const groupedDefects = groupDefectsByDistance(defectsImages);
    let pipePage = null;

    if (groupedDefects && Object.keys(groupedDefects).length > 0) {
      pipePage = (
        <Page style={styles.page} key={6}>
          <Header />
          <WaterMark />
          <View style={styles.parahead}>
            <Text>Pipline Timeline</Text>
          </View>
          <View style={styles.pipe} />
          <View style={styles.pipeCapTop} />
          <View style={styles.pipeCapBottom} />

          <View style={{ marginTop: 20 }}>
            {(Object.entries(groupedDefects) as [string, any[]][]).map(
              ([scale, imgGroup]) => (
                <View
                  key={scale}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <View style={{ marginLeft: 13, alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    >
                      {`${scale}m`}
                    </Text>
                  </View>
                  <View
                    style={{
                      marginLeft: 5,
                      borderBottom: "1px dotted black",
                      width: 20,
                      height: 1,
                    }}
                  />
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginLeft: 25,
                    }}
                  >
                    {imgGroup.map((img, index) => {
                      const severity = img.defects?.[0]?.defect?.severity ?? 1;
                      return (
                        <View
                          key={index}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <View
                            style={{
                              width: 60,
                              height: 1,
                              borderBottom: "1px dotted black",
                            }}
                          />
                          <View
                            style={{
                              alignItems: "center",
                              marginBottom: 8,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: "bold",
                                marginBottom: 2,
                                textAlign: "center",
                              }}
                            >
                              {img.title}
                            </Text>
                            <View
                              style={{
                                border: `2px solid ${severityColors[severity]}`,
                                width: 100,
                                height: 60,
                                padding: 2,
                              }}
                            >
                              <Image
                                src={getValidUrl(img.imageUrl, userId)}
                                style={{ width: "100%", height: "100%" }}
                              />
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )
            )}
          </View>
          <View style={styles.boxcontainer}>
            <View style={styles.box}>
              <View style={styles.parahead}>
                <Text>Severity Grade</Text>
              </View>
              {[5, 4, 3, 2, 1].map((level) => (
                <View key={level} style={styles.legendItem}>
                  <Text>•</Text>
                  <Text style={styles.legendText}>{level}</Text>
                  <View
                    style={[
                      styles.colorBox,
                      { backgroundColor: severityColors[level] },
                    ]}
                  />
                </View>
              ))}
            </View>
          </View>
          <Footer provider={report.poweredBy} />
        </Page>
      );
    }

    const observationImages = defectsMeta?.observationImages || [];
    const observationPages =
      observationImages.length > 0
        ? observationImages.reduce((acc: any[], image: any, index: number) => {
            try {
              if (index % 2 === 0) {
                acc.push(
                  <Page style={styles.page} key={`observation-page-${index}`}>
                    <Header />
                    <WaterMark />
                    <View style={styles.parahead}>
                      <Text>Observation - {index + 1}</Text>
                    </View>
                    <View
                      style={{
                        width: "90%",
                        margin: "0 auto",
                        height: "30%",
                        marginBottom: 10,
                      }}
                    >
                      <Image
                        src={
                          getValidUrl(image.imageUrl, userId) ||
                          "No observation image available"
                        }
                      />
                    </View>
                    <View
                      style={{
                        width: "90%",
                        margin: "0 auto",
                        border: "1px solid black",
                        fontSize: 11,
                      }}
                    >
                      <Text style={{ padding: 5, fontWeight: "bold" }}>
                        Observation Description{"\n"}
                      </Text>
                      <Text style={{ padding: 5 }}>
                        {image.description ?? "No description"}
                      </Text>
                    </View>

                    {observationImages[index + 1] && (
                      <>
                        <View style={styles.parahead}>
                          <Text>Observation - {index + 2}</Text>
                        </View>
                        <View
                          style={{
                            width: "90%",
                            margin: "0 auto",
                            marginBottom: 10,
                            height: "30%",
                          }}
                        >
                          <Image
                            src={
                              getValidUrl(
                                observationImages[index + 1].imageUrl,
                                userId
                              ) || "No observation image available"
                            }
                          />
                        </View>

                        <View
                          style={{
                            width: "90%",
                            border: "1px solid black",
                            margin: "0 auto",
                            fontSize: 11,
                          }}
                        >
                          <Text style={{ padding: 5, fontWeight: "bold" }}>
                            Observation Description{"\n"}
                          </Text>
                          <Text style={{ padding: 5 }}>
                            {observationImages[index + 1].description ??
                              "No description"}
                          </Text>
                        </View>
                      </>
                    )}
                    <Footer provider={report.poweredBy} />
                  </Page>
                );
              }
            } catch (error) {
              console.error(
                `Error generating observation page for index ${index}:`,
                error
              );
            }
            return acc;
          }, [])
        : [];

    const allPages = [...pages, ...defectPages, ...observationPages, pipePage];
    return <Document>{allPages}</Document>;
  } else {
    const pages = [
      <Page size={"A4"} style={styles.page} key={1}>
        <View style={styles.section}>
          <View style={styles.border} />
        </View>
        <View>
          <View
            style={{
              textAlign: "right",
              marginTop: 200,
              marginBottom: 120,
              fontSize: 20,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>
              Solinas Integrity Private Ltd.
            </Text>
            <Text>
              {"{Water Pipeline/Manhole and Sewer}"}{" "}
              <Text style={{ fontWeight: "bold" }}>Inspection</Text>
            </Text>
          </View>
          <View style={{ textAlign: "right", marginBottom: 100 }}>
            <Text style={{ fontSize: 16 }}>Prepared for</Text>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              {formatCustomerName(report.reportMeta.preparedFor)}
            </Text>
          </View>
          <View style={{ textAlign: "right", fontSize: 12, marginBottom: 80 }}>
            <Text style={{ marginBottom: 2 }}>{report.reportMeta.address}</Text>
            <Text>
              <Text>
                {report.reportMeta.dateRange.startDate.replace(/,/g, "")} -{" "}
                {report.reportMeta.dateRange.endDate.replace(/,/g, "")}
              </Text>
            </Text>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              marginBottom: 10,
              marginTop: 80,
            }}
          >
            <Image
              style={{ width: 130, height: 20 }}
              src="/images/solinas-header.png"
            />
          </View>
          <View>
            <Text style={{ textAlign: "right", fontSize: 12 }}>
              D305, Solinas Integrity Pvt. Ltd,{"\n"}
              C/O IITM Incubation Cell,{"\n"}
              Kanagam Road, Taramani,{"\n"}
              Chennai - 600113, Tamil Nadu
            </Text>
          </View>
        </View>
      </Page>,
      <Page style={styles.page} size={"A4"} key={2}>
        <MultiDateHeader
          startDate={report.reportMeta.dateRange.startDate}
          endDate={report.reportMeta.dateRange.endDate}
        />
        <WaterMark />
        <View style={styles.parahead}>
          <Text style={{ marginTop: 10 }}>NOTICE</Text>
        </View>
        <View style={styles.para}>
          <Text style={{ marginTop: 10 }}>
            The information contained in this report is provided for
            interpretation by a suitably qualified civil engineering
            professional engaged by the Client presented. This report is not
            intended and must not be taken as professional civil engineering
            advice, nor shall it be relied upon as a substitute for professional
            civil engineering advice. Interpretation of this report, evaluation
            of the pipelines, and any rehabilitation, investigative, cleaning,
            or other decisions are the sole responsibility of the Client.
            Certain information contained in this report such as distances and
            dimensions may incorporate information provided by others. The
            information may not always be accurate and complete. The engineer
            should make their own assessments regarding such information. The
            information contained in this document may be confidential. It is
            intended only for the use of the Client. However, any disclosure,
            reproduction, distribution, or other dissemination or use of the
            information contained in this document is not to be done to other
            parties without the written consent of Solinas Integrity Private
            Limited.
          </Text>
        </View>
        <View style={styles.parahead}>
          <Text style={{ marginTop: 15 }}>EXECUTIVE SUMMARY</Text>
        </View>
        <View style={styles.para}>
          <Text style={{ marginBottom: 10 }}>
            Solinas Inspection Service provides pipeline solution that comes
            with the dashboard that helps tracking, maintaining, and analysing
            the information. It has features that helps in planning for the
            inspections (Inspection Management), tracking the status of the
            issue (resolved/unresolved), generating reports for any given period
            and Geographic Information System which helps us in visualising the
            overall problem.
          </Text>
          <Text style={{ marginBottom: 10 }}>
            Our solution is used for internal condition assessment and defect
            detection in pipelines that characterizes and pinpoints the location
            of defects along with analytics so that asset managers can take
            preventive maintenance actions thereby reducing losses. We detect
            critical defects leading to the pipeline leakage and perform overall
            internal condition assessment to identify wall defects,
            encrustations and unidentified objects and their locations, for
            corresponding corrective actions to be taken at specified sections
            of pipeline minimal digging of the roads.
          </Text>
          <Text style={{ marginBottom: 10 }}>
            We would like to thank{" "}
            <Text style={{ fontWeight: "bold" }}>
              {formatCustomerName(report.reportMeta.preparedFor)}{" "}
            </Text>
            for its unconditional support. We would like to thank the various
            staff for their continued assistance during the various phases of
            the inspection work, without your support such a challenging work
            could not have been possible.
          </Text>
        </View>
        <View style={styles.parahead}>
          <Text>INSPECTION PROCEDURE</Text>
        </View>
        <View style={styles.para}>
          <Text>
            <Text style={{ fontWeight: "bold" }}>
              Pre-inspection – site preparation:
            </Text>{" "}
            Access point in the pipeline is opened and the pipelines are
            dewatered. Equipment and tools were transported to the site location
            to perform the inspection with the help of{" "}
            <Text style={{ fontWeight: "bold" }}>
              {formatCustomerName(report.reportMeta.preparedFor)}
            </Text>
            . Considering the sizes of the pipeline and the space available for
            insertion of the tools, cameras were chosen to perform the inline
            video inspection. Safety precautions were taken after thorough
            preliminary study of the subject to perform the inspection safely.
          </Text>
        </View>
        <Footer provider={report.poweredBy} />
      </Page>,
      <Page style={styles.page} key={3}>
        <MultiDateHeader
          startDate={report.reportMeta.dateRange.startDate}
          endDate={report.reportMeta.dateRange.endDate}
        />
        <WaterMark />
        <View style={[styles.para, { marginTop: 10 }]}>
          <Text>
            <Text style={{ fontWeight: "bold" }}>
              Installation of inspection equipment:
            </Text>{" "}
            Once the site was prepared for inspection, it was handed over to
            Solinas team for installing the inspection equipment.
          </Text>
        </View>
        <View
          style={{
            textAlign: "left",
            fontSize: 12,
            width: "90%",
            margin: "0 auto",
            marginBottom: 5,
          }}
        >
          <Text>Inspection Equipment:</Text>
        </View>
        <View
          style={{
            fontSize: 12,
            textAlign: "justify",
            width: "90%",
            margin: "0 auto",
            lineHeight: 1.5,
            padding: 15,
          }}
        >
          <Text>• Video Cameras with DVR</Text>
          <Text>• Endobot/Endoscopy and Other Mechanical Tools</Text>
          <Text>• Personal Protective Equipment (PPE)</Text>
        </View>
        <View style={styles.para}>
          <Text>
            <Text style={{ fontWeight: "bold" }}>Inspection:</Text> The
            Endobot/endoscopy was inserted into the pipeline through an opening,
            remotely controlled with the help of a tether. The equipment was
            driven inside the pipeline through controlled manual feed or remote
            in case of Endobot. The live video feed from the camera is obtained
            at the base station. The feedback is used to identify and locate the
            critical spots in the pipeline. The locations of the defects were
            recorded and this data is provided immediately for precise
            localization of the defects/features identified.
          </Text>
        </View>
        <View style={styles.parahead}>
          <Text>Pipeline Grading</Text>
        </View>
        <View style={styles.para}>
          <Text>
            Pipeline grading refers to the process of evaluating and rating the
            condition of a pipeline, usually for the purpose of determining its
            integrity and remaining service life. It depends on the type and age
            of the pipeline, the material it is made of, and the purpose of the
            inspection. Once the internal conditional assessment is performed
            using Endobot, the severity grade for each defect is mapped using
            the bellow mentioned parameters (refer the table) and the results
            are used to assess the overall condition of the pipeline and
            determine any necessary repairs or maintenance.
          </Text>
        </View>
        <View
          style={{
            textAlign: "center",
            margin: "0 auto",
            width: "90%",
            marginTop: 15,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              borderWidth: 1,
              borderColor: "black",
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 12,
                fontWeight: "bold",
                padding: 5,
                borderRightWidth: 1,
                borderColor: "black",
              }}
            >
              Severity Grade
            </Text>
            <Text
              style={{
                flex: 2,
                fontSize: 12,
                fontWeight: "bold",
                padding: 5,
                borderRightWidth: 1,
                borderColor: "black",
              }}
            >
              Description of Condition
            </Text>
            <Text
              style={{ flex: 3, fontSize: 12, fontWeight: "bold", padding: 5 }}
            >
              Estimated Time to Failure
            </Text>
          </View>
          {[
            [
              "1",
              "Pipe segment has minor defects",
              "Failure unlikely in the foreseeable future",
            ],
            [
              "2",
              "Pipe segment has minor defects",
              "Pipe unlikely to fail for at least 7 years",
            ],
            [
              "3",
              "Pipe segment has moderate defects",
              "Deterioration may continue, at 3–5-year timeframe",
            ],
            [
              "4",
              "Pipe segment has severe defects",
              "Risk of failure within the next 2 years",
            ],
            [
              "5",
              "Requires immediate attention",
              "Pipe segment has failed/will likely fail immediately",
            ],
          ].map((row, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                borderWidth: 1,
                borderColor: "black",
                borderTopWidth: 0,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  fontSize: 11,
                  padding: 5,
                  borderRightWidth: 1,
                  borderColor: "black",
                  textAlign: "center",
                }}
              >
                {row[0]}
              </Text>
              <Text
                style={{
                  flex: 2,
                  fontSize: 11,
                  padding: 5,
                  borderRightWidth: 1,
                  borderColor: "black",
                  textAlign: "left",
                }}
              >
                {row[1]}
              </Text>
              <Text
                style={{ flex: 3, fontSize: 11, padding: 4, textAlign: "left" }}
              >
                {row[2]}
              </Text>
            </View>
          ))}
        </View>
        <Footer provider={report.poweredBy} />
      </Page>,
      <Page style={styles.page} key={4}>
        <MultiDateHeader
          startDate={report.reportMeta.dateRange.startDate}
          endDate={report.reportMeta.dateRange.endDate}
        />
        <WaterMark />
        <View style={styles.parahead}>
          <Text style={{ marginTop: 15 }}>Risk Analysis</Text>
        </View>
        <View style={styles.para}>
          <Text style={{ marginBottom: 10 }}>
            Risk analysis is done to each section of pipeline being inspected;
            it is done with the help of the below mentioned matrix. Initially
            with all the defects and the condition of the pipeline the
            probability of failure is calculated.
            <Text style={{ fontWeight: "bold" }}>
              Probability of failure (POF)
            </Text>{" "}
            refers to the likelihood that a particular component or system will
            fail to perform its intended function. Later, the consequence of the
            failure is calculated.
            <Text style={{ fontWeight: "bold" }}>
              Consequence of failure (COF)
            </Text>{" "}
            refers to the potential impact or outcome of a failure of a
            particular component or system.
          </Text>
        </View>
        <View style={{ width: "90%", margin: "0 auto" }}>
          <Image src="/images/risk-chart.png" />
        </View>
        <View style={styles.para}>
          <Text style={{ marginTop: 15, marginBottom: 15 }}>
            <Text style={{ fontWeight: "bold" }}>Risk rating </Text>
            is a process of evaluating and assigning a numerical or qualitative
            value to the risks associated with a particular component or system.
            It is done her by multiplying the value of POF and COF. It has
            numerical values ranging from 1 to 25.
          </Text>
        </View>
        <View
          style={{
            width: "90%",
            textAlign: "justify",
            paddingLeft: 20,
            fontSize: 12,
            lineHeight: 1.5,
            margin: "0 auto",
            marginBottom: 10,
          }}
        >
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: "bold" }}>High risk (Red):</Text> These
            have a high likelihood of occurring and/or a high potential impact.
            These risks are considered the most significant and may require
            immediate attention or urgent risk management action. Anything equal
            to or above 10 is considered as high risk.
          </Text>
          <Text style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: "bold" }}> Medium risk (Blue):</Text>{" "}
            These have a moderate likelihood of occurring and/or a moderate
            potential impact. These risks may require some level of risk
            management action, but may not be as urgent as high-risk. Anything
            equal to or above 5 and below 10 is considered as medium risk.
          </Text>
          <Text>
            <Text style={{ fontWeight: "bold" }}>Low risk (White):</Text> These
            have a low likelihood of occurring and/or a low potential impact.
            These risks are considered the least significant and may not require
            immediate risk management action. Anything below 5 is considered as
            low risk.
          </Text>
        </View>
        <View style={styles.para}>
          <Text>
            Overall, the goal of risk analysis in pipelines is to identify and
            assess the potential risks and hazards associated with the pipeline
            and its operation, and to implement strategies to minimize or
            eliminate those risks. This helps ensure the safe and reliable
            operation of the pipeline and protect the personnel and the
            environment.
          </Text>
        </View>
        <Footer provider={report.poweredBy} />
      </Page>,
    ];

    const dynamicPages =
      data?.data?.inspections?.length > 0
        ? data.data.inspections.flatMap((inspection: any, index: number) => {
            const pages = [];
            const risk = inspection.riskAssessment ?? {};
            const recommendations = inspection?.keyRecommendations ?? [];
            let recCounter = 1;
            const tableData = [
              [
                "Location",
                inspection.siteInfo?.location ?? "N/A",
                "Direction",
                inspection.siteInfo?.direction ?? "N/A",
              ],
              [
                "Age of pipeline",
                inspection.siteInfo?.ageOfPipeline ?? "N/A",
                "Type of Pipeline",
                inspection.siteInfo?.typeOfPipeline ?? "N/A",
              ],
              [
                "Pipeline Material",
                inspection.siteInfo?.pipelineMaterial ?? "N/A",
                "Pipeline Diameter",
                inspection.siteInfo?.pipelineDiameter ?? "N/A",
              ],
              [
                "GPS Co-ordinates",
                inspection.siteInfo?.gpsCoordinates ?? "N/A",
                "Inspection Length",
                inspection.siteInfo?.inspectionLength ?? "N/A",
              ],
            ];

            pages.push(
              <Page key={`inspection-${index}-info`} style={styles.page}>
                <MultiDateHeader
                  startDate={report.reportMeta.dateRange.startDate}
                  endDate={report.reportMeta.dateRange.endDate}
                />
                <WaterMark />
                <View style={styles.parahead}></View>
                <View
                  style={{
                    width: "90%",
                    fontSize: 11,
                    margin: "0 auto",
                    marginTop: 10,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderStyle: "solid",
                  }}
                >
                  {tableData.map((row, rowIndex) => (
                    <View
                      key={rowIndex}
                      style={{
                        flexDirection: "row",
                        borderBottomWidth:
                          rowIndex === tableData.length - 1 ? 0 : 1,
                      }}
                    >
                      {row.map((cell, cellIndex) => (
                        <Text
                          key={`${rowIndex}-${cellIndex}`}
                          style={{
                            flex: cellIndex % 2 === 0 ? 1 : 1.5,
                            borderRightWidth:
                              cellIndex === row.length - 1 ? 0 : 1,
                            padding: 5,
                            textAlign: cellIndex % 2 === 0 ? "left" : "center",
                            fontWeight: cellIndex % 2 === 0 ? "bold" : "normal",
                          }}
                        >
                          {cell}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
                <View style={styles.parahead}>
                  <Text>GIS Mapping</Text>
                </View>
                <View
                  style={{
                    width: "90%",
                    margin: "0 auto",
                    height: "30%",
                    marginBottom: 10,
                    marginTop: 10,
                  }}
                >
                  <Image
                    src={
                      getValidUrl(inspection.gisMapping?.imageUrl, userId) ||
                      "NA"
                    }
                  />
                </View>

                {(risk.rating || risk.category) && (
                  <>
                    <View style={styles.parahead}>
                      <Text>Risk Analysis of this pipeline</Text>
                    </View>
                    <View style={{ width: "90%", margin: "0 auto" }}>
                      <View
                        style={{
                          flexDirection: "row",
                          borderWidth: 1,
                          borderColor: "black",
                        }}
                      >
                        <View
                          style={{
                            flex: 1,
                            borderRightWidth: 1,
                            borderColor: "black",
                          }}
                        >
                          <Text
                            style={{
                              padding: 5,
                              fontSize: 11,
                              fontWeight: "bold",
                            }}
                          >
                            Risk Rating
                          </Text>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            borderRightWidth: 1,
                            borderColor: "black",
                          }}
                        >
                          <Text
                            style={{
                              padding: 5,
                              fontSize: 11,
                              textAlign: "center",
                            }}
                          >
                            {risk.rating}
                          </Text>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            borderRightWidth: 1,
                            borderColor: "black",
                          }}
                        >
                          <Text
                            style={{
                              padding: 5,
                              fontSize: 11,
                              fontWeight: "bold",
                            }}
                          >
                            Risk Category
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              padding: 5,
                              fontSize: 11,
                              textAlign: "center",
                            }}
                          >
                            {risk.category}
                          </Text>
                        </View>
                      </View>
                      {risk.description && (
                        <View
                          style={{
                            borderWidth: 1,
                            borderColor: "black",
                            borderTopWidth: 0,
                          }}
                        >
                          <Text
                            style={{
                              padding: 5,
                              fontSize: 11,
                              fontWeight: "bold",
                            }}
                          >
                            Description on Major findings:
                          </Text>
                          <Text style={{ padding: 5, fontSize: 11 }}>
                            {risk.description}
                          </Text>
                        </View>
                      )}
                    </View>
                  </>
                )}
                {Array.isArray(recommendations) &&
                  recommendations.length > 0 && (
                    <>
                      <View style={{ ...styles.parahead, marginTop: 5 }}>
                        <Text>KEY RECOMMENDATIONS:</Text>
                      </View>
                      <View
                        style={{
                          fontSize: 12,
                          width: "90%",
                          lineHeight: 1.5,
                          margin: "0 auto",
                          padding: 10,
                        }}
                      >
                        {recommendations.map((rec, recIndex) => (
                          <Text
                            key={`rec-${inspection.inspectionId}-${recIndex}`}
                          >
                            • {rec.description.trim()}
                          </Text>
                        ))}
                      </View>
                    </>
                  )}
                <Footer provider={report.poweredBy} />
              </Page>
            );

            const defectsMeta = inspection?.defectsMeta?.[0];
            const defectImages = defectsMeta?.defectsImages || [];
            let defectCounter = 1;
            let pageCounter = 1;

            const multiDefectImages = defectImages.filter(
              (img: any) => (img?.defects?.length ?? 0) > 1
            );
            const singleDefectImages = defectImages.filter(
              (img: any) => (img?.defects?.length ?? 0) === 1
            );

            const renderDefectBlock = (image: any, defectNo: number) => {
              const imageDefects = image?.defects ?? [];

              return (
                <View
                  key={`defect-block-${defectNo}`}
                  style={{ marginBottom: 10 }}
                >
                  <View
                    style={{
                      fontSize: 12,
                      fontWeight: "bold",
                      textAlign: "center",
                      marginBottom: 5,
                    }}
                  >
                    <Text>Defect - {defectNo}</Text>
                  </View>

                  <View
                    style={{
                      width: "90%",
                      height: 200,
                      margin: "0 auto",
                      marginBottom: 10,
                    }}
                  >
                    <Image src={getValidUrl(image?.imageUrl, userId) || "NA"} />
                  </View>

                  {imageDefects.map((defect: any, idx: number) => (
                    <View
                      key={`defect-table-${idx}`}
                      style={{
                        width: "90%",
                        borderLeft: "1px solid black",
                        borderRight: "1px solid black",
                        borderTop: idx === 0 ? "1px solid black" : "none",
                        margin: "0 auto",
                        fontSize: 11,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          textAlign: "center",
                          borderBottom:
                            idx === imageDefects.length
                              ? "none"
                              : "1px solid black",
                        }}
                      >
                        <Text
                          style={{
                            flex: 1,
                            borderRight: "1px solid black",
                            fontWeight: "bold",
                            padding: 3,
                          }}
                        >
                          Distance
                        </Text>
                        <Text
                          style={{
                            flex: 1,
                            borderRight: "1px solid black",
                            padding: 3,
                          }}
                        >
                          {defect?.distance ?? "-"}
                        </Text>
                        <Text
                          style={{
                            flex: 2,
                            borderRight: "1px solid black",
                            fontWeight: "bold",
                            padding: 3,
                          }}
                        >
                          Defect Code
                        </Text>
                        <Text
                          style={{
                            flex: 1,
                            borderRight: "1px solid black",
                            padding: 3,
                          }}
                        >
                          {defect?.defect?.code ?? "-"}
                        </Text>
                        <Text
                          style={{
                            flex: 2,
                            borderRight: "1px solid black",
                            fontWeight: "bold",
                            padding: 3,
                          }}
                        >
                          Severity Grade
                        </Text>
                        <Text style={{ flex: 1, padding: 3 }}>
                          {defect?.defect?.severity ?? "-"}
                        </Text>
                      </View>
                    </View>
                  ))}

                  <View
                    style={{
                      width: "90%",
                      margin: "0 auto",
                      fontSize: 11,
                      border: "1px solid black",
                      borderTopWidth: 0,
                    }}
                  >
                    <Text style={{ fontWeight: "bold", padding: 5 }}>
                      Description
                    </Text>
                    <Text style={{ padding: 5, paddingTop: 0 }}>
                      {image?.description ?? "-"}
                    </Text>
                  </View>
                </View>
              );
            };

            multiDefectImages.forEach((image: any) => {
              pages.push(
                <Page
                  style={styles.page}
                  key={`defect-multi-${
                    inspection.inspectionId
                  }-${pageCounter++}`}
                >
                  <MultiDateHeader
                    startDate={report.reportMeta.dateRange.startDate}
                    endDate={report.reportMeta.dateRange.endDate}
                  />
                  <WaterMark />
                  {renderDefectBlock(image, defectCounter++)}
                  <Footer provider={report.poweredBy} />
                </Page>
              );
            });

            for (let i = 0; i < singleDefectImages.length; i += 2) {
              const currentPair = singleDefectImages.slice(i, i + 2);

              pages.push(
                <Page
                  style={styles.page}
                  key={`defect-pair-${
                    inspection.inspectionId
                  }-${pageCounter++}`}
                >
                  <MultiDateHeader
                    startDate={report.reportMeta.dateRange.startDate}
                    endDate={report.reportMeta.dateRange.endDate}
                  />
                  <WaterMark />
                  {currentPair[0] &&
                    renderDefectBlock(currentPair[0], defectCounter++)}
                  {currentPair[1] &&
                    renderDefectBlock(currentPair[1], defectCounter++)}
                  <Footer provider={report.poweredBy} />
                </Page>
              );
            }

            const groupedDefects = groupDefectsByDistance(defectImages);
            let pageIndex = 0;

            if (groupedDefects && Object.keys(groupedDefects).length > 0) {
              pages.push(
                <Page
                  style={styles.page}
                  key={`timeline-${inspection.inspectionId}-${pageIndex++}`}
                >
                  <MultiDateHeader
                    startDate={report.reportMeta.dateRange.startDate}
                    endDate={report.reportMeta.dateRange.endDate}
                  />
                  <WaterMark />
                  <View style={styles.parahead}>
                    <Text>Pipline Timeline</Text>
                  </View>
                  <View style={styles.pipe} />
                  <View style={styles.pipeCapTop} />
                  <View style={styles.pipeCapBottom} />

                  <View style={{ marginTop: 20 }}>
                    {(Object.entries(groupedDefects) as [string, any[]][]).map(
                      ([scale, imgGroup]) => (
                        <View
                          key={scale}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 20,
                          }}
                        >
                          <View
                            style={{ marginLeft: 13, alignItems: "center" }}
                          >
                            <Text
                              style={{
                                fontSize: 12,
                                fontWeight: "bold",
                              }}
                            >
                              {`${scale}m`}
                            </Text>
                          </View>
                          <View
                            style={{
                              marginLeft: 5,
                              width: 20,
                              height: 1,
                              borderBottom: "1px dotted black",
                            }}
                          />
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginLeft: 25,
                            }}
                          >
                            <View
                              style={{
                                paddingHorizontal: 5,
                                width: 20,
                                height: 1,
                                borderBottom: "1px dotted black",
                              }}
                            />
                            {imgGroup.map((img, index) => {
                              const severity =
                                img.defects?.[0]?.defect?.severity ?? 1;
                              return (
                                <View
                                  key={index}
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                  }}
                                >
                                  <View
                                    style={{
                                      width: 50,
                                      height: 1,
                                      borderBottom: "1px dotted black",
                                    }}
                                  />
                                  <View
                                    style={{
                                      alignItems: "center",
                                      marginBottom: 8,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        fontSize: 10,
                                        fontWeight: "bold",
                                        textAlign: "center",
                                        marginBottom: 2,
                                      }}
                                    >
                                      {img.title}
                                    </Text>
                                    <View
                                      style={{
                                        border: `2px solid ${severityColors[severity]}`,
                                        width: 100,
                                        height: 60,
                                        padding: 2,
                                      }}
                                    >
                                      <Image
                                        src={getValidUrl(img.imageUrl, userId)}
                                        style={{
                                          width: "100%",
                                          height: "100%",
                                        }}
                                      />
                                    </View>
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        </View>
                      )
                    )}
                  </View>
                  <View style={styles.boxcontainer}>
                    <View style={styles.box}>
                      <View style={styles.parahead}>
                        <Text>Severity Grade</Text>
                      </View>
                      {[5, 4, 3, 2, 1].map((level) => (
                        <View key={level} style={styles.legendItem}>
                          <Text>•</Text>
                          <Text style={styles.legendText}>{level}</Text>
                          <View
                            style={[
                              styles.colorBox,
                              { backgroundColor: severityColors[level] },
                            ]}
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                  <Footer provider={report.poweredBy} />
                </Page>
              );
            }

            const observationImages = defectsMeta?.observationImages || [];
            if (observationImages.length > 0) {
              for (let i = 0; i < observationImages.length; i += 2) {
                pages.push(
                  <Page
                    style={styles.page}
                    key={`observation-${inspection.inspectionId}-${i}`}
                  >
                    <MultiDateHeader
                      startDate={report.reportMeta.dateRange.startDate}
                      endDate={report.reportMeta.dateRange.endDate}
                    />
                    <WaterMark />
                    <View style={styles.parahead}>
                      <Text>Observation - {i + 1}</Text>
                    </View>
                    <View
                      style={{
                        width: "90%",
                        height: "30%",
                        margin: "0 auto",
                        marginBottom: 5,
                      }}
                    >
                      <Image
                        src={
                          getValidUrl(observationImages[i]?.imageUrl, userId) ||
                          "NA"
                        }
                      />
                    </View>
                    <View
                      style={{
                        width: "90%",
                        margin: "0 auto",
                        border: "1px solid black",
                        fontSize: 11,
                      }}
                    >
                      <Text style={{ padding: 5, fontWeight: "bold" }}>
                        Observation Description{"\n"}
                      </Text>
                      <Text style={{ padding: 5 }}>
                        {observationImages[i]?.description ?? "No description"}
                      </Text>
                    </View>

                    {observationImages[i + 1] && (
                      <>
                        <View style={styles.parahead}>
                          <Text>Observation - {i + 2}</Text>
                        </View>
                        <View
                          style={{
                            width: "90%",
                            height: "30%",
                            margin: "0 auto",
                            marginBottom: 5,
                          }}
                        >
                          <Image
                            src={
                              getValidUrl(
                                observationImages[i + 1]?.imageUrl,
                                userId
                              ) || "NA"
                            }
                          />
                        </View>
                        <View
                          style={{
                            width: "90%",
                            border: "1px solid black",
                            margin: "0 auto",
                            fontSize: 11,
                          }}
                        >
                          <Text style={{ padding: 5, fontWeight: "bold" }}>
                            Observation Description{"\n"}
                          </Text>
                          <Text style={{ padding: 5 }}>
                            {observationImages[i + 1]?.description ??
                              "No description"}
                          </Text>
                        </View>
                      </>
                    )}
                    <Footer provider={report.poweredBy} />
                  </Page>
                );
              }
            }
            return pages;
          })
        : [];

    const allPages = [...pages, ...dynamicPages];
    return <Document>{allPages}</Document>;
  }
};
