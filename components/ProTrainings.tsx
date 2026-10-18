import Script from "next/script";

// ProTrainings Approved Centre badge and course video widget, from the
// embed code ProTrainings supplied (centre 91719, facilitator 12222,
// course 303). The widget script fills the .pt-video placeholder.
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

export function ProTrainingsVideo() {
  return (
    <>
      <div className="pt-video" data-width="465" data-facilitator-id="12222" data-course-id="303" />
      <Script src="https://procourses.co.uk/javascripts/widgets.js?v=20230502" strategy="lazyOnload" />
    </>
  );
}
