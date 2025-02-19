"use client";

import Image from "next/image";

export function ProductHuntBadge() {
  return (
    <a
      href="https://www.producthunt.com/posts/the-background-text?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-the&#0045;background&#0045;text"
      target="_blank"
    >
      <Image
        src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=892257&theme=light&t=1739972708416"
        alt="The&#0032;Background&#0032;Text - Put&#0032;text&#0032;behind&#0032;images&#0032;for&#0032;free&#0044;&#0032;in&#0032;your&#0032;browser | Product Hunt"
        width="125"
        height="27"
      />
    </a>
  );
}
