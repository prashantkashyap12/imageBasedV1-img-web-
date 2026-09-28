import { verifyPayment } from "helper/Pricing_helper";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const navigate = useNavigate();

  const orderId = searchParams.get("order_id");

  useEffect(() => {
    if (!orderId) {
      setStatus("error");
      return;
    }

    verifyPayment(orderId)
      .then((res) => {
        if (res.status === true) {
          setStatus("success");
        } else {
          setStatus("failed");
        }
      })
      .catch(() => setStatus("error"));
  }, [orderId]);

  const config = {
    loading: {
      icon: "⏳",
      title: "Verifying Payment",
      text: "Please wait while we verify your payment.",
      color: "#0d6efd",
    },
    success: {
      icon: "✓",
      title: "Payment Successful",
      text: "Your subscription has been activated successfully.",
      color: "#28a745",
    },
    failed: {
      icon: "✕",
      title: "Payment Failed",
      text: "We couldn't verify your payment.",
      color: "#dc3545",
    },
    error: {
      icon: "!",
      title: "Verification Error",
      text: "Something went wrong while verifying payment.",
      color: "#ffc107",
    },
  };

  const current = config[status];

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "20px",
      }}
    >
      <div
        className="bg-white"
        style={{
          width: "100%",
          maxWidth: "560px",
          borderRadius: "18px",
          overflow: "hidden",
          boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            height: "6px",
            background: current.color,
          }}
        />

        <div className="text-center p-5">
          <div
            className="mx-auto mb-4 d-flex align-items-center justify-content-center"
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              background: `${current.color}15`,
              color: current.color,
              fontSize: "42px",
              fontWeight: "700",
            }}
          >
            {current.icon}
          </div>

          <h2
            style={{
              fontWeight: "700",
              color: "#212529",
            }}
          >
            {current.title}
          </h2>

          <p
            className="mt-3 mb-4"
            style={{
              color: "#6c757d",
              fontSize: "15px",
            }}
          >
            {current.text}
          </p>

          {orderId && (
            <div
              className="mb-4"
              style={{
                background: "#f8f9fa",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <small
                className="d-block text-muted"
                style={{ letterSpacing: "1px" }}
              >
                ORDER ID
              </small>

              <div
                style={{
                  fontWeight: "600",
                  color: "#343a40",
                  wordBreak: "break-all",
                }}
              >
                {orderId}
              </div>
            </div>
          )}

          {status === "loading" && (
            <div
              className="spinner-border"
              role="status"
              style={{ color: current.color }}
            />
          )}

          {status === "success" && (
            <button
              className="btn btn-success btn-lg px-5"
              onClick={() => navigate("/admin/subscription")}
            >
              Continue
            </button>
          )}

          {(status === "failed" || status === "error") && (
            <button
              className="btn btn-primary btn-lg px-5"
              onClick={() => navigate("/admin/subscription")}
            >
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;