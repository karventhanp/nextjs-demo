import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { authService } from "@/services/authService";
import { Customer, ProductTypes } from "@/types/customer";
import { setCustomerInStorage } from "@/helpers/helper";
import { useRouter } from "next/navigation";

const SearchCustomers = () => {
  const [value, setValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { showPopup, customers, setShowPopup, setCustomerName, setCustomerId, setShowSideMenuDesktop, setMenuItems, menuItems } =
    useAppContext();
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Record<string, string[]>>({});
  const [showProduct, setShowProduct] = useState<number | undefined>();
  const router = useRouter();

  const goToProduct = (customer: Customer, product: string) => {
    setCustomerInStorage(customer.id, customer.name);
    setCustomerId(customer.id);
    setCustomerName(customer.name);
    setMenuItems(menuItems.map(item => {
      return {...item, active: false}
    }))
    setShowSideMenuDesktop(false);
    
    if (product === "in") {
      router.push("/");
    }
    setShowPopup(false);
  };

  const processCustomers = (customerList: Customer[]) => {
    return customerList.map((customer) => {
      setProducts((prev) => ({ ...prev, [customer.id]: customer.attributes["products"] || [] }));
      return customer;
    });
  };

  useEffect(() => {
    setShowProduct(undefined);
    if (value === "") {
      if (customers && customers.length > 0) {
        const sortedCustomers = [...customers]
          .sort((a, b) =>
            a.name.localeCompare(b.name)
          )
          .slice(0, 5);
        setFilteredCustomers(processCustomers(sortedCustomers));
      } else {
        setFilteredCustomers([]);
      }
      return;
    }
    if (customers && customers.length > 0) {
      const filtered = customers.filter((customer) =>
       customer.name
          .toLowerCase()
          .includes(value.trim().toLowerCase())
      );
      setFilteredCustomers(processCustomers(filtered));
    }
  }, [value, customers]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setValue('');
    setShowProduct(undefined);
  }, [showPopup]);
  return (
    <div className="w-full pt-[10%] flex flex-col gap-4">
      <div className="w-full relative flex">
        <Image
          src="/images/search-icon.svg"
          width={22}
          height={22}
          alt="Search"
          className="absolute top-1/2 left-2 -translate-y-1/2"
        />
        <input
          type="text"
          ref={inputRef}
          placeholder="Search customer"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="border border-platinum ring-0 focus:border-primary outline-none focus:ring-0 rounded-2xl py-4 w-full px-10 text-sm  text-smokyBlack"
          autoFocus={true}
        />
        <Image
          src="/images/close-black.svg"
          width={20}
          height={20}
          alt="Clear"
          className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer"
          onClick={() => setValue("")}
        />
      </div>
      {filteredCustomers.length > 0 && (
        <div className="w-full rounded-2xl p-2 bg-snow gap-1 flex flex-col overflow-y-auto h-fit max-h-[72vh] custom-scrollbar">
          {filteredCustomers.map((customer, index) => (
            <div
              key={index}
              className={`w-full ${
                index === showProduct ? "bg-ghostWhite border" : "bg-snow"
              } rounded-lg flex flex-col border-platinum p-1`}
            >
              <div
                className={`w-full flex justify-between cursor-pointer hover:bg-ghostWhite rounded-lg  ${
                  index === showProduct ? "p-2" : "p-3"
                }`}
                onClick={() =>
                  setShowProduct((prev) => (prev === index ? undefined : index))
                }
              >
                <h5
                  className={`text-sm font-medium truncate ${
                    index === showProduct ? "text-smokyBlack" : "text-liver"
                  }`}
                >
                  {customer.name}
                </h5>
                <Image
                  src="/images/down-icon.svg"
                  width={18}
                  height={18}
                  className={`${index === showProduct ? "hidden" : "block"}`}
                  alt="Go to customer"
                />
                <Image
                  src="/images/down-icon.svg"
                  width={20}
                  height={20}
                  alt="Choosed"
                  className={`rotate-180 ${
                    index === showProduct ? "block" : "hidden"
                  }`}
                />
              </div>
              {index === showProduct && (
                <div className="flex gap-2 px-2 pb-2 overflow-x-auto scrollbar-none">
                  {products[customer.id] && products[customer.id].length > 0 ? (
                    products[customer.id].map((product, index) => (
                      <div
                        key={index}
                        className="p-4 bg-snow min-w-28 text-center w-fit rounded-lg font-bold text-liver text-xs cursor-pointer shadow-medium"
                        onClick={() => goToProduct(customer, product)}
                      >
                        {ProductTypes[product].label.toUpperCase()}
                      </div>
                    ))
                  ) : (
                    <h5 className="text-center font-medium text-liver text-xs">
                      No products found
                    </h5>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchCustomers;
