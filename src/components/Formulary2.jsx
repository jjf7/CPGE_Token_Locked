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

      const amount = await contractToken.balanceOf(account);

      // approve bloquear el 80%

      const tokensToApprove = (amount * PERCENT) / 100;

      console.log(`tokensToApprove: ${tokensToApprove}`);

      const txResponse3 = await contractToken.approve(
        ADDRESS_LOCKED_CONTRACT,
        tokensToApprove.toString()
      );

      await txResponse3.wait();

      const amountInWei = (amount / 10).toString();

      const txResponse2 = await contractLocked.lock(amountInWei);
      await txResponse2.wait();

      toast.success("Tokens bloqueados exitosamente!");

      const tokensBloqueados = await contractLocked.locks(account);
      setTokensBloqueados(
        ethers.utils.formatEther(tokensBloqueados.amount) / 10
      );

      const balance = await contractToken.balanceOf(account);

      setBalance(ethers.utils.formatEther(balance) / 10);

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
