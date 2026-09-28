// import React from "react";


// export default function LoadingBanner({ isWaiting, isLoading }) {
//   if (!isWaiting && !isLoading) return null;

//   const style = {
//     position:  "absolute",
//     top:       5,
//     left:      "50%",
//     transform: "translateX(-50%)",
//     padding:   "6px 12px",
//     borderRadius: 6,
//     zIndex:    1050,
//     fontWeight: 500,
//     fontSize: "0.85rem",
//   };

//   if (isWaiting) {
//     return (
//       <div style={{ ...style, background: "#fff3cd", color: "#856404" }}>
//         Loading more records in 3 s…
//       </div>
//     );
//   }

//   return (
//     <div style={{ ...style, background: "#cce5ff", color: "#004085" }}>
//       Loading more records…
//     </div>
//   );
// }
