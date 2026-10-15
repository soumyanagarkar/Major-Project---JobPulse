import { useState } from "react";
import "./FAQ.css";

import {
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

function FAQ() {

  const faqs = [

    {
      question: "Is JobPulse AI free to use?",
      answer:
        "Yes. You can create an account and use the core career analysis features for free. Premium AI features can be added in the future.",
    },

    {
      question: "How does JobPulse AI recommend jobs?",
      answer:
        "Our AI analyzes your skills, projects, resume, preferred role and career goals to recommend the most relevant opportunities.",
    },

    {
      question: "Is my resume secure?",
      answer:
        "Absolutely. Your uploaded resume and profile data remain private and are only used to provide personalized recommendations.",
    },

    {
      question: "How is the Resume Match Score calculated?",
      answer:
        "The AI compares your resume with industry expectations and job requirements to calculate an optimized match score.",
    },

    {
      question: "Can I update my profile later?",
      answer:
        "Yes. You can update your profile, resume, skills, projects and career preferences anytime from your dashboard.",
    },

  ];

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (

    <section className="faq">

      <div className="faq-header">

        <span>FAQ</span>

        <h2>
          Frequently Asked
          <br />
          Questions
        </h2>

        <p>
          Everything you need to know about JobPulse AI.
        </p>

      </div>

      <div className="faq-container">

        {faqs.map((faq, index) => (

          <div
            className={`faq-item ${
              activeIndex === index ? "active" : ""
            }`}
            key={index}
          >

            <div
              className="faq-question"
              onClick={() => toggleFAQ(index)}
            >

              <h3>{faq.question}</h3>

              {activeIndex === index ? (
                <FaChevronUp />
              ) : (
                <FaChevronDown />
              )}

            </div>

            <div className="faq-answer">

              <p>{faq.answer}</p>

            </div>

          </div>

        ))}

      </div>

    </section>

  );
}

export default FAQ;