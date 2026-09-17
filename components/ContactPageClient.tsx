"use client";

import { useEffect, useState, type FormEvent } from "react";
import { getSocialIcon } from "@/lib/socialIcons";
import type { SiteConfig } from "@/studio/lib/helpers";
import { useReducedMotion } from "@/lib/useReducedMotion";

const defaults = {
  sectionLabel: "Get in Touch",
  heading: "Let's Work Together",
  introText: "Have a project in mind? I'd love to hear about it. Let's create something beautiful together.",
  location: "Los Angeles, CA",
  availability: "Open for projects",
  quote: "Every great photograph begins with a conversation.",
  formLabels: {
    name: "Name",
    email: "Email",
    projectType: "Project Type",
    message: "Message",
    submitButton: "Send Message",
  },
  formPlaceholders: {
    name: "Your name",
    email: "your@email.com",
    projectType: "Select a project type",
    message: "Tell me about your project...",
  },
  projectTypes: [
    "Lifestyle Photography",
    "Ecommerce & Product",
    "Brand Campaign",
    "Other",
  ],
  successMessage: "Thank you! Your message has been sent.",
  errorMessage: "Something went wrong. Please try again.",
};

interface ContactPageClientProps {
  siteConfig: SiteConfig;
}

export default function ContactPageClient({ siteConfig }: ContactPageClientProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setIsLoaded(true);
      return;
    }
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  const contactPage = siteConfig?.contactPage;

  const sectionLabel = contactPage?.sectionLabel || defaults.sectionLabel;
  const heading = contactPage?.heading || defaults.heading;
  const introText = contactPage?.introText || defaults.introText;
  const location = contactPage?.location || defaults.location;
  const availability = contactPage?.availability || defaults.availability;
  const quote = contactPage?.quote || defaults.quote;

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
    (t): t is string => t !== null && t !== undefined && t.length > 0
  );
  const projectTypes = (cmsProjectTypes && cmsProjectTypes.length > 0) ? cmsProjectTypes : defaults.projectTypes;

  const successMessage = contactPage?.successMessage || defaults.successMessage;
  const errorMessage = contactPage?.errorMessage || defaults.errorMessage;

  const socialLinks = siteConfig?.socialLinks?.filter(
    (link): link is NonNullable<typeof link> & { url: string } =>
      link !== null && link !== undefined && !!link.url
  ) || [];

  const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_ID;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus("submitting");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const endpoint = formspreeId
        ? `https://formspree.io/f/${formspreeId}`
        : "/api/contact";

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
    <div className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        {/* Header — left-aligned */}
        <div className="mb-16 md:mb-20 max-w-2xl">
          <p
            className={`text-[0.6875rem] tracking-[0.3em] uppercase text-warm-gray-lighter mb-4 transition-all duration-1000 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{
              transitionTimingFunction: "var(--ease-luxe)",
              transitionDelay: "100ms",
            }}
          >
            {sectionLabel}
          </p>
          <h1
            className={`font-display text-4xl md:text-5xl lg:text-6xl font-light text-warm-gray mb-6 transition-all duration-1000 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionTimingFunction: "var(--ease-luxe)" }}
          >
            {heading}
          </h1>
          {/* Accent rule */}
          <div className="w-16 h-px bg-accent mb-6" />
          <p
            className={`text-warm-gray-light transition-all duration-1000 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{
              transitionTimingFunction: "var(--ease-luxe)",
              transitionDelay: "200ms",
            }}
          >
            {introText}
          </p>
        </div>

        {/* Split Layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Form */}
          <div
            className={`transition-all duration-1000 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionTimingFunction: "var(--ease-luxe)",
              transitionDelay: "300ms",
            }}
          >
            <form
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm tracking-wide text-warm-gray mb-2"
                >
                  {formLabels.name}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="editorial-input"
                  placeholder={formPlaceholders.name}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm tracking-wide text-warm-gray mb-2"
                >
                  {formLabels.email}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="editorial-input"
                  placeholder={formPlaceholders.email}
                />
              </div>

              <div>
                <label
                  htmlFor="project-type"
                  className="block text-sm tracking-wide text-warm-gray mb-2"
                >
                  {formLabels.projectType}
                </label>
                <div className="relative">
                  <select
                    id="project-type"
                    name="project-type"
                    className="editorial-input cursor-pointer appearance-none pr-6"
                  >
                    <option value="">{formPlaceholders.projectType}</option>
                    {projectTypes.map((type, index) => (
                      <option key={index} value={type.toLowerCase().replace(/\s+/g, '-')}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray-light pointer-events-none"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm tracking-wide text-warm-gray mb-2"
                >
                  {formLabels.message}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="editorial-input resize-none"
                  placeholder={formPlaceholders.message}
                />
              </div>

              <button
                type="submit"
                disabled={formStatus === "submitting"}
                className="px-10 py-4 text-sm tracking-[0.1em] uppercase bg-warm-gray text-cream hover:bg-accent transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ transitionTimingFunction: "var(--ease-luxe)" }}
              >
                {formStatus === "submitting" ? "Sending..." : formLabels.submitButton}
              </button>

              {formStatus === "success" && (
                <p role="status" aria-live="polite" className="text-accent text-sm animate-fade-in-up">
                  {successMessage}
                </p>
              )}

              {formStatus === "error" && (
                <p role="alert" className="text-red-600 text-sm animate-fade-in-up">
                  {errorMessage}
                </p>
              )}
            </form>
          </div>

          {/* Contact Info — clean typography with vertical rule */}
          <div
            className={`transition-all duration-1000 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionTimingFunction: "var(--ease-luxe)",
              transitionDelay: "400ms",
            }}
          >
            <div className="lg:border-l lg:border-cream-darker lg:pl-12 h-full">
              <h2 className="font-display text-2xl md:text-3xl font-light text-warm-gray mb-8">
                {contactPage?.contactInfoHeading || "Contact Information"}
              </h2>

              {/* Email */}
              {siteConfig?.email && (
                <div className="mb-8">
                  <p className="text-[0.6875rem] tracking-[0.2em] uppercase text-warm-gray-lighter mb-2">
                    {contactPage?.emailLabel || "Email"}
                  </p>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="text-lg text-warm-gray hover:text-accent transition-colors duration-300"
                  >
                    {siteConfig.email}
                  </a>
                </div>
              )}

              {/* Location */}
              <div className="mb-8">
                <p className="text-[0.6875rem] tracking-[0.2em] uppercase text-warm-gray-lighter mb-2">
                  {contactPage?.locationLabel || "Based In"}
                </p>
                <p className="text-lg text-warm-gray">
                  {location}
                </p>
              </div>

              {/* Availability */}
              <div className="mb-10">
                <p className="text-[0.6875rem] tracking-[0.2em] uppercase text-warm-gray-lighter mb-2">
                  {contactPage?.availabilityLabel || "Availability"}
                </p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-lg text-warm-gray">
                    {availability}
                  </p>
                </div>
              </div>

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div>
                  <p className="text-[0.6875rem] tracking-[0.2em] uppercase text-warm-gray-lighter mb-4">
                    {contactPage?.socialLabel || "Follow Along"}
                  </p>
                  <div className="flex gap-4">
                    {socialLinks.map((link) => (
                      <a
                        key={link.platform || link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-11 h-11 flex items-center justify-center rounded-full border border-warm-gray-lighter/30 text-warm-gray-light hover:text-accent hover:border-accent transition-all duration-300"
                        style={{ transitionTimingFunction: "var(--ease-luxe)" }}
                        aria-label={link.platform || "Social link"}
                      >
                        {getSocialIcon(link.platform)}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Decorative Quote */}
              <div className="mt-12 pt-8 border-t border-warm-gray-lighter/30">
                <p className="font-display text-xl md:text-2xl italic text-warm-gray-light leading-relaxed">
                  &ldquo;{quote}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* No contact info fallback */}
        {!siteConfig?.email && socialLinks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-warm-gray-light">
              Add your contact information through the{" "}
              <a href="/studio" className="text-accent hover:text-accent-dark underline">
                studio
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
