import React from "react";
import { useSelector } from "react-redux";
import { url } from "../slices/api";
import axios from "axios";

const PayButton = ({ cartItem }) => {
  const user = useSelector((state) => state.auth);
  //   console.log(user)
  const handleClick = () => {
    // console.log(cartItem);
    axios
      .post(`${url}/stripe/create-checkout-session`, {
        cartItem,
        userId: user.id,
      })
      .then((res) => {
        if (res.data.url) {
          window.location.href = res.data.url;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <>
      <button onClick={() => handleClick()}>Check Out</button>
    </>
  );
};

export default PayButton;
