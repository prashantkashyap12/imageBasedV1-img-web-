import NormalHeader from "components/Headers/NormalHeader";
import { addPackage } from "helper/Pricing_helper";
import React, { useState } from "react";
import { FaTrash, FaPlus, FaGripVertical, FaSpinner } from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function CreateSubscription() {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    packageName: "",
    subHeading: "",
    creditLimit: "",
    amount: "",
  });

  const [benefits, setBenefits] = useState([
    "Priority Support",
    "Unlimited Scanning",
  ]);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBenefitChange = (index, value) => {
    const updated = [...benefits];
    updated[index] = value;
    setBenefits(updated);
  };

  const addBenefit = () => {
    setBenefits([...benefits, ""]);
  };

  const removeBenefit = (index) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);

    const packageData = {
      ...formData,
      packageList: benefits
        .filter((benefit) => benefit.trim() !== "")
        .map((benefit) => ({
          // packId: 0,
          bulletPoints: benefit,
        })),
    };

    if (!formData.packageName || !formData.amount || !formData.creditLimit) {
      toast.error("Please fill all the required fields");
      setLoading(false);
      return;
    }

    try {
      const response = await addPackage(packageData);
      console.log(response);

      toast.success("Package Created Sucessfully");
      navigate(-1);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <NormalHeader />

      <div
        className="container"
        style={{ padding: "24px", position: "relative", top: "-100px" }}
      >
        <div
          className="bg-white border rounded shadow-sm mx-auto"
          style={{ maxWidth: "900px" }}
        >
          <div className="p-4">
            {/* Header */}
            <div className="border-bottom pb-3 mb-4">
              <h3 className="font-weight-bold mb-1">Create Paclage</h3>

              <p className="text-muted mb-0">
                Configure the pricing and features for your new subscription
                tier.
              </p>
            </div>

            {/* Form Fields */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label>
                  Package Name <span className="text-danger">*</span>
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="packageName"
                  placeholder="e.g. Enterprise"
                  value={formData.packageName}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label>Description</label>

                <input
                  type="text"
                  className="form-control"
                  name="subHeading"
                  placeholder="e.g. For large-scale teams"
                  value={formData.subHeading}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label>Credit Limit</label>

                <input
                  type="number"
                  className="form-control"
                  name="creditLimit"
                  placeholder="0"
                  value={formData.creditLimit}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label>
                  Amount <span className="text-danger">*</span>
                </label>

                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">$</span>
                  </div>

                  <input
                    type="number"
                    className="form-control"
                    name="amount"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="border-top pt-4 mt-2">
              <h5 className="font-weight-bold mb-3">Package Benefits</h5>

              {benefits.map((benefit, index) => (
                <div key={index} className="d-flex align-items-center mb-3">
                  <FaGripVertical className="text-muted mr-2" size={18} />

                  <input
                    type="text"
                    className="form-control"
                    value={benefit}
                    onChange={(e) => handleBenefitChange(index, e.target.value)}
                    placeholder="Enter benefit"
                  />

                  <button
                    type="button"
                    className="btn btn-link text-danger ml-2"
                    onClick={() => removeBenefit(index)}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-link p-0"
                onClick={addBenefit}
                hidden={benefits.length >= 5}
              >
                <FaPlus className="mr-1" />
                Add Feature
              </button>
            </div>

            {/* Footer */}
            <div className="border-top pt-4 mt-4 d-flex justify-content-end">
              <button
                onClick={() => navigate(-1)}
                type="button"
                className="btn btn-outline-secondary mr-2"
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading ? (
                  <>
                    <FaSpinner
                      className="mr-2"
                      style={{
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Saving...
                  </>
                ) : (
                  "Save Package"
                )}
              </button>
            </div>
          </div>
        </div>

        <style>
          {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
        </style>
      </div>
    </div>
  );
}

export default CreateSubscription;
