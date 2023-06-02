import { useState } from "react";
import { useGlobalState } from "../context/GlobalState";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ethers } from "ethers";
import Loader from "./Loader";
import { ADDRESS_LOCKED_CONTRACT, PERCENT } from "../constants";

const digitsOnly = (value) =>
  /^\d*[.{1}\d*]\d*$/.test(value) || value.length === 0;

const Formulary2 = () => {
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

      const amount = await contractToken.balanceOf(account); //wei 19 decimales
      
      // approve bloquear el 80%

      const tokenAmount = ethers.BigNumber.from(amount).mul(PERCENT/10).div(10);

      const txResponse3 = await contractToken.approve(
        ADDRESS_LOCKED_CONTRACT,
        tokenAmount
      );

      await txResponse3.wait();

      const amountInWei = ethers.BigNumber.from(amount).div(10);


      const txResponse2 = await contractLocked.lock(amountInWei);
      await txResponse2.wait();

      toast.success("Tokens bloqueados exitosamente!");

      const tokensBloqueados = await contractLocked.locks(account);
    

      setTokensBloqueados(
        ethers.utils.formatEther(tokensBloqueados.amount, { commify: true, pad: true, digits: 2 }) 
      );

      const balance = await contractToken.balanceOf(account);
     

      setBalance(ethers.utils.formatEther(balance, { commify: true, pad: true, digits: 2 }) );

      setLoading(false);
      setDisa(false);
    } catch (error) {
      toast.info(error.message);
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
                "BLOQUEAR TOKENS"
              )}
            </button>
          )}
        </Form>
      </Formik>
      <ToastContainer />
    </>
  );
};

export default Formulary2;
