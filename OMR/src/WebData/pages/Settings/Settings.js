import React, { use, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { fetchIP } from "../../services/common";

const Settings = () => {
  const [ips, setIPS] = useState(["localhost"]);
  const [selectedIP, setSelectedIP] = useState(ips[0]);
  useEffect(() => {
    const fetchIPs = async () => {
      const res = await fetchIP();
      if (res?.success) {
        setIPS(res.ipAddresses);
      }
    };
    fetchIPs();
  }, []);
  const token = JSON.parse(localStorage.getItem("userData"));
  const onCsvBackupHandler = async () => {
    try {
      await axios.post(
        `${window.SERVER_IP}/settings/csvbackup`,
        {},
        {
          headers: {
            token: token,
          },
        }
      );
      toast.success("CSV Backup completed successfully!");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const onMysqlBackupHandler = async () => {
    try {
      await axios.post(
        `${window.SERVER_IP}/settings/mysqlbackup`,
        {},
        {
          headers: {
            token: token,
          },
        }
      );
      toast.success("Mysql backup completed successfully!");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };
  const setIpHandler = async () => {
    const obj = { ip: selectedIP };

    if (selectedIP) {
      const result = window.confirm("Are you sure you want to change the IP?");
      if (result) {
        const response = await axios.post(
          "http://localhost:4000/settings/setIp",
          obj
        );

        if (response.data?.success) {
          toast.success("IP changed successfully!");
          window.location.replace(window.location.href); 
        }
      }
    }
  };
  return (
    <div className=" flex justify-center items-center bg-gradient-to-r from-blue-400 to-blue-600 h-[100vh] pt-20">
      <div className="bg-white w-4/6 lg:w-1/2 xl:w-1/3 rounded-3xl py-8 px-8 shadow-md">
        <h1 className="px-6 py-2 text-3xl font-semibold flex items-center ">
          BACKUP -
        </h1>
        <div className="flow-root px-4 py-3 mb-3 shadow-sm">
          <dl className="-my-3 divide-y divide-gray-100 text-lg">
            <div className="grid grid-cols-1 gap-1 p-4 even:bg-gray-50 sm:grid-cols-3 sm:gap-1">
              <dt className="font-medium text-gray-900">Mysql backup</dt>
              <div className="inline-flex rounded-lg border border-gray-100 bg-gray-100 p-1">
                <button
                  onClick={onMysqlBackupHandler}
                  className="inline-block rounded-md bg-white px-4 py-2 text-sm text-blue-500 shadow-sm focus:relative"
                >
                  GET BACKUP
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1 p-4 even:bg-gray-50 sm:grid-cols-3 sm:gap-1">
              <dt className="font-medium text-gray-900">Csv backup</dt>
              <div className="inline-flex text-center rounded-lg border border-gray-100 bg-gray-100 p-1">
                <button
                  onClick={onCsvBackupHandler}
                  className="inline-block rounded-md bg-white px-4 py-2 text-sm text-blue-500 shadow-sm focus:relative"
                >
                  GET BACKUP
                </button>
              </div>
            </div>
          </dl>
        </div>
        <div className="flex items-center space-x-3 px-4 py-3 mb-3 shadow-sm bg-white rounded-md">
          <dt className="font-medium text-gray-900">Set Public IP</dt>
          {/* <select
            value={selectedIP}
            onChange={(e) => setSelectedIP(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
          >
            {ips.map((ip, index) => (
              <option key={index} value={ip}>
                {ip}
              </option>
            ))}
          </select> */}
          <input
           className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
          type="text"
          onChange={(e) => setSelectedIP(e.target.value)}
          value={selectedIP} />
          <button
            onClick={setIpHandler}
            className="inline-block rounded-md bg-blue-500 px-4 py-2 text-sm text-white shadow-sm hover:bg-blue-600 focus:ring-2 focus:ring-blue-300"
          >
            SET
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
