"use client";

import { useState, type FormEvent } from "react";
import type { SiteConfig } from "@/studio/lib/helpers";

const defaults = {
  sectionLabel: "Contact",
  heading: "Let's talk",
  formLabels: {
    name: "Name",
    email: "Email",
    projectType: "Project Type",
    message: "Project",
    submitButton: "Send enquiry",
  },
  formPlaceholders: {
    name: "Your name",
    email: "you@brand.com",
    projectType: "Select a project type",
    message: "What you need, timeline, anything else",
  },
  successMessage: "Thanks — your brief has been noted.",
  errorMessage: "Something went wrong. Please try again or email me directly.",
  contactInfoHeading: "Direct",
  availability: "Replies within two working days.",
};

interface ContactPageClientProps {
  siteConfig: SiteConfig;
}

export default function ContactPageClient({ siteConfig }: ContactPageClientProps) {
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const contactPage = siteConfig?.contactPage;

  const sectionLabel = contactPage?.sectionLabel || defaults.sectionLabel;
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

  const cmsProjectTypes = contactPage?.projectTypes?.filter(
    (t): t is string => !!t && t.length > 0
  );

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
    <div className="max-w-[1240px] mx-auto px-5 md:px-[clamp(20px,5vw,64px)] pt-[90px]">
      <section className="pt-[72px] pb-14 max-w-[64ch]">
        <span className="block font-body text-xs tracking-[0.14em] uppercase text-ink/50 mb-[18px]">{sectionLabel}</span>
        <h1 className="font-heading font-black text-[clamp(34px,4.2vw,52px)] leading-none tracking-[-0.01em] m-0">
          {heading}
        </h1>
      </section>

      <section className="grid lg:grid-cols-2 gap-14 lg:gap-[72px] border-t border-ink/10 pt-14 pb-20">
        <div>
          <span className="block font-body text-xs tracking-[0.14em] uppercase text-ink/50 mb-6">Send a brief</span>
          <form onSubmit={handleSubmit} className="grid gap-6 max-w-[44ch]">
            <label className="grid gap-2">
              <span className="text-xs tracking-[0.1em] uppercase text-ink/55">{formLabels.name}</span>
              <input type="text" name="name" required className="editorial-input" placeholder={formPlaceholders.name} />
            </label>

            <label className="grid gap-2">
              <span className="text-xs tracking-[0.1em] uppercase text-ink/55">{formLabels.email}</span>
              <input type="email" name="email" required className="editorial-input" placeholder={formPlaceholders.email} />
            </label>

            {cmsProjectTypes && cmsProjectTypes.length > 0 && (
              <label className="grid gap-2">
                <span className="text-xs tracking-[0.1em] uppercase text-ink/55">{formLabels.projectType}</span>
                <select name="project-type" className="editorial-input cursor-pointer appearance-none">
                  <option value="">{formPlaceholders.projectType}</option>
                  {cmsProjectTypes.map((type) => (
                    <option key={type} value={type.toLowerCase().replace(/\s+/g, "-")}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="grid gap-2">
              <span className="text-xs tracking-[0.1em] uppercase text-ink/55">{formLabels.message}</span>
              <textarea name="message" rows={5} required className="editorial-input resize-y" placeholder={formPlaceholders.message} />
            </label>

            <button
              type="submit"
              disabled={formStatus === "submitting"}
              className="justify-self-start mt-1 bg-ink text-paper border-0 px-7 py-[15px] font-body text-sm font-semibold tracking-[0.02em] cursor-pointer hover:bg-ink/85 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formStatus === "submitting" ? "Sending..." : formLabels.submitButton}
            </button>

            {formStatus === "success" && (
              <p role="status" aria-live="polite" className="text-[13.5px] leading-[21px] text-ink/60 m-0">
                {successMessage}
              </p>
            )}
            {formStatus === "error" && (
              <p role="alert" className="text-[13.5px] leading-[21px] text-red-700 m-0">
                {errorMessage}
              </p>
            )}
          </form>
        </div>

        <div>
          <span className="block font-body text-xs tracking-[0.14em] uppercase text-ink/50 mb-6">
            {contactPage?.contactInfoHeading || defaults.contactInfoHeading}
          </span>
          {siteConfig?.email && (
            <a
              href={`mailto:${siteConfig.email}`}
              className="font-accent italic font-light text-[clamp(22px,2.4vw,30px)] leading-[1.25] no-underline inline-block mb-3"
            >
              {siteConfig.email}
            </a>
          )}
          <p className="text-sm leading-[22px] text-ink/60 mb-2.5 mt-0">
            {contactPage?.availability || defaults.availability}
          </p>
          {contactPage?.location && (
            <p className="text-xs tracking-[0.1em] uppercase text-ink/38 m-0">{contactPage.location}</p>
          )}
        </div>
      </section>
    </div>
  );
}
