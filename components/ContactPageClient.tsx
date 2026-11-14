"use client";

import { useState, type FormEvent } from "react";
import type { SiteConfig } from "@/studio/lib/helpers";
import { toValidSocialLinks } from "@/lib/types";
import "./contact/contact.css";

// The page's words. The heading, labels, project types, location and availability come from Sanity when they are
// filled in there; the one-line intro is fixed on purpose (Roberta's own wording, shorter than what Sanity holds).
const defaults = {
  heading: "Let's Work Together",
  intro: "Have a project in mind? I'd love to hear about it.",
  formLabels: {
    name: "Name",
    email: "Email",
    projectType: "Project type",
    message: "Message",
    submitButton: "Send message",
  },
  formPlaceholders: {
    name: "Your name",
    email: "your@email.com",
    projectType: "Select a project type",
    message: "Tell me about your project...",
  },
  successMessage: "Thank you! Your message has been sent.",
  errorMessage: "Something went wrong. Please try again or email me directly.",
  availability: "Open for projects",
};

interface ContactPageClientProps {
  siteConfig: SiteConfig;
}

export default function ContactPageClient({ siteConfig }: ContactPageClientProps) {
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const contactPage = siteConfig?.contactPage;

  const heading = contactPage?.heading || defaults.heading;

  const formLabels = {
    name: contactPage?.formLabels?.name || defaults.formLabels.name,
    email: contactPage?.formLabels?.email || defaults.formLabels.email,
    projectType: contactPage?.formLabels?.projectType || defaults.formLabels.projectType,
    message: contactPage?.formLabels?.message || defaults.formLabels.message,
    submitButton: contactPage?.formLabels?.submitButton || defaults.formLabels.submitButton,
  };

  const formPlaceholders = {
    name: contactPage?.formPlaceholders?.name || defaults.formPlaceholders.name,
    email: contactPage?.formPlaceholders?.email || defaults.formPlaceholders.email,
    projectType: contactPage?.formPlaceholders?.projectType || defaults.formPlaceholders.projectType,
    message: contactPage?.formPlaceholders?.message || defaults.formPlaceholders.message,
  };

  const projectTypes = contactPage?.projectTypes?.filter((t): t is string => !!t && t.length > 0);
  const socials = toValidSocialLinks(siteConfig?.socialLinks || []);

  const successMessage = contactPage?.successMessage || defaults.successMessage;
  const errorMessage = contactPage?.errorMessage || defaults.errorMessage;

  const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_ID;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus("submitting");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const endpoint = formspreeId ? `https://formspree.io/f/${formspreeId}` : "/api/contact";
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        setFormStatus("success");
        form.reset();
      } else {
        setFormStatus("error");
      }
    } catch {
      setFormStatus("error");
    }
  };

  return (
    <div className="ct-page">
      <div className="ct-wrap">
        <h1 className="ct-h1">{heading}</h1>
        <p className="ct-intro">{defaults.intro}</p>

        <div className="ct-cols">
          <form onSubmit={handleSubmit} className="ct-form">
            <label>
              <span className="ct-label">{formLabels.name}</span>
              <input type="text" name="name" required placeholder={formPlaceholders.name} />
            </label>

            <label>
              <span className="ct-label">{formLabels.email}</span>
              <input type="email" name="email" required placeholder={formPlaceholders.email} />
            </label>

            {projectTypes && projectTypes.length > 0 && (
              <label>
                <span className="ct-label">{formLabels.projectType}</span>
                <select name="project-type" defaultValue="">
                  <option value="">{formPlaceholders.projectType}</option>
                  {projectTypes.map((type) => (
                    <option key={type} value={type.toLowerCase().replace(/\s+/g, "-")}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label>
              <span className="ct-label">{formLabels.message}</span>
              <textarea name="message" rows={5} required placeholder={formPlaceholders.message} />
            </label>

            <button type="submit" disabled={formStatus === "submitting"} className="ct-send">
              {formStatus === "submitting" ? "Sending..." : formLabels.submitButton}
            </button>

            <p className="ct-msg" role={formStatus === "error" ? "alert" : "status"} aria-live="polite">
              {formStatus === "success" && successMessage}
              {formStatus === "error" && errorMessage}
            </p>
          </form>

          <div className="ct-direct">
            {siteConfig?.email && (
              <>
                <span className="ct-label">Email</span>
                <a className="ct-mail" href={`mailto:${siteConfig.email}`}>
                  {siteConfig.email}
                </a>
              </>
            )}
            {socials.length > 0 && (
              <>
                <span className="ct-label">Follow along</span>
                <div className="ct-soc">
                  {socials.map((s) => (
                    <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.platform}
                    </a>
                  ))}
                </div>
              </>
            )}
            {contactPage?.location && (
              <>
                <span className="ct-label">Based in</span>
                <p>{contactPage.location}</p>
              </>
            )}
            <span className="ct-label">Availability</span>
            <p>{contactPage?.availability || defaults.availability}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
