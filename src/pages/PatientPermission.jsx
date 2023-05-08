import React, { useState } from "react";
import { Button } from "react-bootstrap";
import MyFooter from "../components/MyFooter";
import PatientSideBar from "../components/PatientSideBar";
import { BsCheckCircleFill, BsFillTrash3Fill } from "react-icons/bs";
import { useLocation } from 'react-router-dom';
import Web3 from "web3";
import detectEthereumProvider from '@metamask/detect-provider'
import { useEffect } from "react";

export default function PatientPermission() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const acount = searchParams.get('account');

  const [wEb3, setwEb3] = useState({
    provider: null,
    web3: null,
  })

  const providerChanged = (provider) => { provider.on("chainChanged", _ => window.location.reload()); }


  //get WEB3
  useEffect(() => {
    const loadProvider = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        providerChanged(provider);
        setwEb3({
          provider,
          web3: new Web3(provider)
        })
      }
    }
    loadProvider();
  }, []);

  const [Contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  ///// get Contract
  useEffect(() => {

    const loadcontract = async () => {
      const contractfile = await fetch('/contracts/MedRecChain.json');
      const convert = await contractfile.json();
      const networkid = await wEb3.web3.eth.net.getId();
      const networkDate = convert.networks[networkid];
      if (networkDate) {

        const abi = convert.abi;
        const address = convert.networks[networkid].address;
        const contract = await new wEb3.web3.eth.Contract(abi, address);

        setContract(contract);

      } else {
        window.alert("only ganache");
        window.location.reload();
        console.log(networkid);
      }

    }

    loadcontract();

  }, [wEb3]);

  ////////////////////
  const [Doctor, setDoctor] = useState({
    DoctorPublickey: ""
  });

  const handleChange = (e) => {
    setDoctor({ ...Doctor, [e.target.name]: e.target.value });
  };

  // for patient Give Permission.
  const handleSubmit = (e) => {
    try {
      setIsLoading(true);
      e.preventDefault();
      const sendrequestAccess = async (doc) => {
        await Contract.methods.approveAccess(doc.DoctorPublickey).send(
          {
            from: acount
          },
          function (error) {
            if (error) { setIsLoading(false); }
          }
        );
        alert("Request sended Successfully.");

      }
      sendrequestAccess(Doctor);
    }
    catch (e) {
      alert("Request Not sended !!.");
    }
  };



  const [Requestdate, setRequestdate] = useState([]);


  const getallRequestdates = async () => {
    const date = await Contract.methods.get_all_requests().call({ from: acount });
    setRequestdate(date);

  }
  getallRequestdates();



  function convertTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  }


  const buttonStyle = {
    backgroundColor: "white",
    color: "gray",
    fontSize: "16px",
    border: "none",
    padding: "0px 40px ",


  };
  /////////////


  //approve 
  const handleClick = async (doc) => {
    try {
      setIsLoading(true);
      const a = await Contract.methods.approveAccess(doc).send(
        {
          from: acount
        },
        function (error) {
          if (error) {
            if (error.message.includes('User denied transaction signature.')) {
              alert("Request approved Failled!");
              setIsLoading(false);
            }
            else {
              alert("This Request alraedy been Approved!!!");
              setIsLoading(false);
            }
          }
          else {
            alert("Request approved Successfully!");
            setIsLoading(false);
          }
        }
      );

    }
    catch (e) {
      console.log(e);

    }
  };

  //revoke
  const handleRevoke = async (doc) => {
    try {
      setIsLoading(true);
      const d = await Contract.methods.rejectAccess(doc).send(
        {
          from: acount
        },
        function (error) {
          if (error) {
            if (error.message.includes('User denied transaction signature.')) {
              alert("Request Rejected Failled!");
              setIsLoading(false);
            }
            else {
              alert("This Request alraedy  Rejected!!!");
              setIsLoading(false);
            }
          }
          else {
            alert("Request Rejected Successfully!");
            setIsLoading(false);
          }
        }
      );

    }
    catch (e) {
      console.log(e);

    }
  };


  return (
    <>
      <main id="main" className="main container perm">
        <PatientSideBar
          tap1="Profile"
          tap2="My Records"
          tap3="Permission & Requests"
          tap4="Log Out"
        />

        <div className="container"></div>
        <section className="section dashboard">
          <div className="mt-4 mb-4 container">
            <div className="forms">
              <div className="card requests">
                <div className="card-body">
                  <h1 className="card-title">Give Permission</h1>

                  <form onSubmit={handleSubmit} className="container">
                    <div className="">
                      <div className="card-body ms-5 ">
                        <div className="form-outline text-muted ">
                          <label
                            className="form-label"
                            htmlFor="form3Example1cg"
                          >
                            Your public Key
                          </label>
                          <input
                            name="patientPublickey"
                            type="text"
                            id="form3Example1cg"
                            className=" form-control form-control-lg"
                            value={acount}
                            disabled
                          />
                        </div>

                        <div className="form-outline mt-4 text-muted ">
                          <label
                            className="form-label"
                            htmlFor="form3Example1cg"
                          >
                            Doctor Public Key
                          </label>
                          <input
                            name="DoctorPublickey"
                            type="text"
                            id="form3Example1cg"
                            required="required"
                            minlength="42"
                            maxlength="42"
                            className=" form-control form-control-lg"
                            value={Doctor.DoctorPublickey}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="form-outline d-flex mt-4 text-muted ">

                        </div>
                        <div className="row">
                          <div className="col-7">
                            <div className="">
                              <div className="form-outline d-flex mt-4 text-muted ">
                              </div>
                            </div>
                          </div>
                          <div className="col-5">
                            <Button
                              disabled={isLoading}
                              type="submit"
                              className="btn btn-info pe-5 ps-5 ms-5 "
                            >
                              Submit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 mb-4 container">
            <div className="forms">
              <div className="card overflow-auto">
                <div className="card-body">
                  <h3 className="card-title">Requests For You</h3>
                  <table className="table table-borderless datatable">
                    <thead>
                      <tr>
                        <th scope="col">Your Public Key</th>
                        {/* <th scope="col">Sender Type</th> */}
                        <th scope="col">Doctor Public Key</th>
                        <th scope="col">Date</th>
                        <th scope="col">Approve Request</th>
                        <th scope="col">Revoke Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Requestdate.map((date) => {

                        if (date.to_patients_addr == acount) {
                          return (
                            <tr>
                              <td scope="row">{date.to_patients_addr}</td>
                              <td>{date.from_doctor_addr}</td>

                              <td>
                                {convertTimestamp(date.date)}
                              </td>

                              <td>
                                <button
                                  disabled={isLoading}
                                  onClick={() => handleClick(date.from_doctor_addr)}
                                  style={buttonStyle}>
                                  <BsCheckCircleFill />
                                </button>


                              </td>
                              <td>
                                <button
                                  disabled={isLoading}
                                  onClick={() => handleRevoke(date.from_doctor_addr)}
                                  style={buttonStyle}>
                                  <BsFillTrash3Fill />
                                </button>


                              </td>
                            </tr>
                          )
                        }
                      })
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <div className="side-footer"><MyFooter /></div>
    </>
  );
}
