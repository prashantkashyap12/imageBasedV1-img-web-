import { load } from "@cashfreepayments/cashfree-js";

export const openCashfreeCheckout = async (paymentSessionId, orderId) => {
  try {
    const cashfree = await load({ mode: "sandbox" });
    return cashfree.checkout({
      paymentSessionId,
      redirectTarget: "_self",
    });
  } catch (error) {
    console.error("Cashfree Error:", error);
    throw new Error("Failed to open payment gateway");  
  }
};
