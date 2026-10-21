"use client";

import { useEffect } from "react";

const WIDGET_SRC = "https://procourses.co.uk/javascripts/widgets.js?v=20230502";

// ProTrainings Approved Centre badge and course video widget, from the
// embed code ProTrainings supplied (centre 91719, facilitator 12222,
// course 303).
export function ProTrainingsBadge() {
  return (
    <a
      className="protrainings-badge"
      href="https://www.protrainings.uk/centres/91719?a=51321"
      target="_blank"
      rel="noopener noreferrer"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- third-party badge */}
      <img
        src="https://d3imrogdy81qei.cloudfront.net/centre_badges/613/91719.png"
        alt="ProTrainings Approved Centre #91719"
        width={180}
      />
    </a>
  );
}

// The widget script scans for .pt-video placeholders once, when it runs,
// and has no init function to call again. next/script only runs a given
// src once per visit, so after client-side navigation back to this page the
// placeholder stayed empty. Adding a fresh script tag on every mount makes it
// scan again; it marks filled placeholders with data-loaded, so no doubles.
export function ProTrainingsVideo() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = WIDGET_SRC;
    script.async = true;
    document.body.appendChild(script);
    return () => script.remove();
  }, []);

  return <div className="pt-video" data-width="465" data-facilitator-id="12222" data-course-id="303" />;
}
