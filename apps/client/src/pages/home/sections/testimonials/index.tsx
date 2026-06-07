/* eslint-disable lingui/text-restrictions */
/* eslint-disable lingui/no-unlocalized-strings */

import { t, Trans } from "@lingui/macro";
import { QuotesIcon } from "@phosphor-icons/react";
import { cn } from "@resume-space/utils";
import { motion } from "framer-motion";

const repositoryUrl = "https://github.com/Oli-yad13/resume-space-";

type Testimonial = {
  quote: string;
  name: string;
};

const testimonials: Testimonial[][] = [
  [
    {
      name: "N. Elnour",
      quote:
        "This is really a thank you for Resume Space. Drafting resumes was never a strength of mine, so your app really made the whole process easy and smooth!",
    },
    {
      name: "S. Bhaije",
      quote:
        "First off, many thanks for making Resume Space. This is one of the best resume-building tools I have ever found. Have also recommended it to many of my university friends...",
    },
    {
      name: "K. Lietzau",
      quote:
        "Hi, I just found your resume builder, and I just want to say, I really appreciate it! The moment I saw it was open source, I closed all the other CV sites I was considering. Thank you for your service.",
    },
  ],
  [
    {
      name: "R. Sinnot",
      quote:
        "Hey, Just wanted to let you know you not only helped me get a job, you helped my partner and my childhood friend, who then used your site to help one of her friends get a job. I sponsored you on Github to give back a bit but I wanted to let you know you really made a difference with your resume builder.",
    },
    {
      name: "P. Jignesh",
      quote:
        "Hey, I am a Mechanical engineer, not understand coding, messy AI, and computer systems, but your website Resume Space is all good. Using it and the effort made to keep this free is remarkable. Keep doing great work.",
    },
  ],
  [
    {
      name: "A. Rehman",
      quote:
        "Hey Amruth, I have loved your Resume Space Website. Thank you so much for making this kind of thing.",
    },
    {
      name: "S. Innocent",
      quote:
        "First of all, I appreciate your effort for making Resume Space a free tool for the community. Very much better than many premium resume builders...",
    },
    {
      name: "M. Fritza",
      quote:
        "Hello, I just wanted to write a thank you message for developing Resume Space. It's easy to use, intuitive and much more practical than many others that make you pay after spending an hour creating your CV. I wish you everything best in life!",
    },
  ],
];

export const TestimonialsSection = () => (
  <section id="testimonials" className="container relative space-y-12 py-24 sm:py-32">
    <div className="space-y-6 text-center">
      <h1 className="text-4xl font-bold">{t`Testimonials`}</h1>
      <p className="mx-auto max-w-2xl leading-relaxed">
        <Trans>
          I always love to hear from the users of Resume Space with feedback or support. Here are
          some of the messages I've received. If you have any feedback, feel free to open an issue
          on{" "}
          <a href={repositoryUrl} className="underline">
            GitHub
          </a>
          .
        </Trans>
      </p>
    </div>

    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-y-0">
      {testimonials.map((columnGroup, groupIndex) => (
        <div key={groupIndex} className="space-y-8">
          {columnGroup.map((testimonial, index) => (
            <motion.figure
              key={index}
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0, transition: { delay: index * 0.25 } }}
              className={cn(
                "relative overflow-hidden rounded-lg bg-secondary-accent p-5 text-primary shadow-lg",
                index > 0 && "hidden lg:block",
              )}
            >
              <QuotesIcon size={64} className="absolute -right-3 bottom-0 opacity-20" />
              <blockquote className="italic leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-3 font-medium">{testimonial.name}</figcaption>
            </motion.figure>
          ))}
        </div>
      ))}
    </div>
  </section>
);
