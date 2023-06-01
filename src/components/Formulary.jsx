import { useState } from "react";
import { useGlobalState } from "../context/GlobalState";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import CustomInput from "./Input";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ethers } from "ethers";

import Loader from "./Loader";
import { ADDRESS_LOCKED_CONTRACT, COST_TOKEN, PERCENT } from "../constants";

const digitsOnly = (value) =>
  /^\d*[.{1}\d*]\d*$/.test(value) || value.length === 0;

const Formulary = () => {
  const {
    account,
    setBalance,
    contractToken,
    contractLocked,
    setTokensBloqueados,
  } = useGlobalState();

  const [loading, setLoading] = useState(false);

  const [disa, setDisa] = useState(false);

  const onsubmit = async ({ amount }, { resetForm }) => {
    try {
      if (amount === 0) {
        return toast.info("Introduce un valor mayor a cero!");
      }

      setLoading(true);

      setDisa(true);

      const convertAmountIntoBNB = (amount * COST_TOKEN).toFixed(6);

      const weiAmount = ethers.utils.parseUnits(convertAmountIntoBNB, "ether");

      console.log(weiAmount.toString()); //  cantidad de BNB que desea enviar para la compra

      const overrides = { value: weiAmount };

      // Compra los tokens
      const txResponse = await contractLocked.buyTokens(overrides);

      await txResponse.wait();

      // approve bloquear el 80%

      const tokensToApprove = ((amount * PERCENT) / 100) * 10;
      console.log(tokensToApprove);

      const tokenAmount = ethers.utils.parseUnits(
        tokensToApprove.toString(),
        "ether"
      ); // cantidad de tokens que desea comprar

      console.log("tokenAmount :" + tokenAmount.toString());

      const txResponse3 = await contractToken.approve(
        ADDRESS_LOCKED_CONTRACT,
        tokenAmount
      );

      await txResponse3.wait();

      const amountInWei = ethers.utils.parseUnits(amount, "ether");

      console.log("amountInWei :" + amountInWei.toString());

      const txResponse2 = await contractLocked.lock(amountInWei);
      await txResponse2.wait();

      console.log("Tokens comprados exitosamente");
      toast.success("Compra exitosa!");

      resetForm();

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
            <>
              Introduce la cantidad de tokens a comprar:
              <CustomInput
                disabled={disa}
                name="amount"
                label="Introduce la cantidad de tokens a comprar"
              />
              <br />
              <h6 style={{ paddingBottom: "2rem" }}>
                Costo (1) Token: {COST_TOKEN} BNB
              </h6>
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
                  "COMPRAR TOKENS"
                )}
              </button>
            </>
          )}
        </Form>
      </Formik>
      <ToastContainer />
    </>
  );
};

export default Formulary;
