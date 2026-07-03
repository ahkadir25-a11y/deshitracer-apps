// "use client";
// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import PageHeader from "@/components/shears/page-header/PageHeader";
// import { useCreateReviewMutation } from "@/app/redux/services/site-reviews";



// const SubmitTestominals = () => {
//   const [name, setName] = useState("");
//   const [rating, setRating] = useState(0);
//   const [reviewText, setReviewText] = useState("");
//   const [submitMessage, setSubmitMessage] = useState("");

//   // Using the mutation hook for creating a review
//   const [createReview, { isLoading, isError, isSuccess }] = useCreateReviewMutation();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Validation
//     if (!name || !rating || !reviewText) {
//       setSubmitMessage("Please fill in all fields.");
//       return;
//     }

//     try {
//       // Call the mutation to create a review
//       await createReview({
//         name,
//         rating,
//         feedback : reviewText,
//       }).unwrap(); // unwrap() will handle success or error responses
//       setSubmitMessage(`Thank you for your review, ${name}!`);
//       // Reset form after successful submission
//       setName("");
//       setRating(0);
//       setReviewText("");
//     } catch (error) {
//       console.log(error)
//       setSubmitMessage("There was an error submitting your review. Please try again.");
//     }
//   };

//   return (
//     <div className="py-20">
//       <PageHeader
//         className="listingBg md:h-[30vh] mb-20 h-[150px]"
//         title="Submit Your Review"
//         subtitle="Your thinking is valuable to us!"
//       />

//       <motion.form
//         className="bg-white max-w-5xl mx-auto p-8 rounded-lg shadow-lg"
//         onSubmit={handleSubmit}
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.8 }}
//       >
//         <div className="mb-4">
//           <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">
//           Your  Full Name
//           </label>
//           <input
//             type="text"
//             id="name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-"
//             placeholder="Enter your name"
//             required
//           />
//         </div>

//         <div className="mb-4">
//           <label htmlFor="rating" className="block text-gray-700 text-sm font-semibold mb-2">
//             Rating (1-5)
//           </label>
//           <select
//             id="rating"
//             value={rating}
//             onChange={(e) => setRating(Number(e.target.value))}
//             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-"
//             required
//           >
//             <option value={0}>Select Rating</option>
//             <option value={1}>1 Star</option>
//             <option value={2}>2 Stars</option>
//             <option value={3}>3 Stars</option>
//             <option value={4}>4 Stars</option>
//             <option value={5}>5 Stars</option>
//           </select>
//         </div>

//         <div className="mb-4">
//           <label htmlFor="review" className="block text-gray-700 text-sm font-semibold mb-2">
//             Your Review
//           </label>
//           <textarea
//             id="review"
//             value={reviewText}
//             onChange={(e) => setReviewText(e.target.value)}
//             className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-"
//             placeholder="Write your review here"
//             rows={4}
//             required
//           />
//         </div>

//         <div className="mb-4 text-center">
//           <motion.button
//             type="submit"
//             className="bg-black text-white px-6 py-2 rounded-lg shadow-md hover:bg-[#222] focus:outline-none focus:ring-2 focus:ring-"
//             whileHover={{ scale: 1.05 }}
//             transition={{ duration: 0.3 }}
//             disabled={isLoading} // Disable button while submitting
//           >
//             {isLoading ? "Submitting..." : "Submit Review"}
//           </motion.button>
//         </div>

//         {submitMessage && (
//           <div className="mt-4 text-center text-lg font-semibold text-[#222]">
//             {submitMessage}
//           </div>
//         )}
//         {isError && !submitMessage && (
//           <div className="mt-4 text-center text-lg font-semibold text-red-600">
//             There was an error submitting your review. Please try again.
//           </div>
//         )}
//         {isSuccess && !submitMessage && (
//           <div className="mt-4 text-center text-lg font-semibold text-[#222]">
//             Review submitted successfully!
//           </div>
//         )}
//       </motion.form>
//     </div>
//   );
// };

// export default SubmitTestominals;
