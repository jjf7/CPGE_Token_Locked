import { useState } from "react";
import { useGlobalState } from "../context/GlobalState";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ethers } from "ethers";
import Loader from "./Loader";
const digitsOnly = (value) =>
  /^\d*[.{1}\d*]\d*$/.test(value) || value.length === 0;

const Formulary3 = () => {
  const {
    account,
    setBalance,
    contractToken,
    contractLocked,
    setTokensBloqueados,
  } = useGlobalState();

  const [loading, setLoading] = useState(false);

  const [disa, setDisa] = useState(false);

  const onsubmit = async () => {
    try {
      setLoading(true);
      setDisa(true);

      const txResponse2 = await contractLocked.unlock();
      await txResponse2.wait();

      toast.success("Tokens desbloqueados exitosamente!");

      const tokensBloqueados = await contractLocked.locks(account);
      
      setTokensBloqueados(
        ethers.utils.formatEther(tokensBloqueados.amount, { commify: true, pad: true, digits: 2 }) 
      );

      const balance = await contractToken.balanceOf(account);
     
      setBalance(ethers.utils.formatEther(balance, { commify: true, pad: true, digits: 2 }) );

      setLoading(false);
      setDisa(false);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
      setLoading(false);
      setDisa(false);
    }
  };

  return (
    <>
      <Formik
        initialValues={{ amount: 0 }}
        onSubmit={onsubmit}
        validationSchema={Yup.object().shape({
          amount: Yup.string().test(
            "inputEntry",
            "The field should have digits only",
            digitsOnly
          ),
        })}
      >
        <Form>
          {account && (
            <button
              disabled={disa}
              style={{ margin: "0px", fontSize: "15px" }}
              className="buy-button"
              type="submit"
            >
              {loading ? (
                <div className="flex">
                  <span>PROCESANDO, ESPERE POR FAVOR</span>
                  <Loader />
                </div>
              ) : (
                "DESBLOQUEAR MIS TOKENS"
              )}
            </button>
          )}
        </Form>
      </Formik>
      <ToastContainer />
    </>
  );
};

export default Formulary3;
