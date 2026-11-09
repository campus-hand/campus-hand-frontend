/** Hills of Kampala strip above the footer: sun by day, moon and stars at night. */
export function KampalaHills({
  className = 'hills block h-[170px] w-full bg-paper',
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 170"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <g className="stars" style={{ fill: '#E9ECF5' }}>
        <circle cx="60" cy="26" r="1.3" />
        <circle cx="150" cy="60" r="1" />
        <circle cx="300" cy="20" r="1.2" />
        <circle cx="420" cy="48" r="1" />
        <circle cx="540" cy="18" r="1.3" />
        <circle cx="660" cy="40" r="1" />
        <circle cx="780" cy="22" r="1.2" />
        <circle cx="880" cy="52" r="1" />
        <circle cx="960" cy="16" r="1.3" />
        <circle cx="1250" cy="28" r="1.2" />
        <circle cx="1330" cy="58" r="1" />
        <circle cx="1400" cy="22" r="1.3" />
      </g>
      <circle
        className="sun"
        cx="210"
        cy="56"
        r="22"
        style={{ fill: 'var(--sun)', stroke: 'var(--edge)', strokeWidth: '2.5' }}
      />
      <path
        className="moon"
        transform="translate(-120 22)"
        d="M336 14a17 17 0 1 0 8 30 13 13 0 1 1-8-30z"
        style={{ fill: 'var(--sun)' }}
      />
      <path
        className="h1"
        d="M0 170V112C160 96 320 92 480 102C640 112 760 90 920 94C1080 98 1240 112 1440 104V170Z"
      />
      <g transform="translate(804 12)">
        <rect
          x="236"
          y="110"
          width="118"
          height="18"
          rx="3"
          style={{ fill: 'var(--cobalt)', stroke: 'var(--edge)', strokeWidth: '2.5' }}
        />
        <rect x="243" y="114" width="107" height="10" style={{ fill: 'var(--sheet,#FFFFFF)' }} />
        <path d="M246 119.0H347" style={{ stroke: 'var(--rule)', strokeWidth: '1' }} />
        <rect
          x="250"
          y="94"
          width="98"
          height="16"
          rx="3"
          style={{ fill: 'var(--sun)', stroke: 'var(--edge)', strokeWidth: '2.5' }}
        />
        <rect x="257" y="98" width="87" height="8" style={{ fill: 'var(--sheet,#FFFFFF)' }} />
        <path d="M260 102.0H341" style={{ stroke: 'var(--rule)', strokeWidth: '1' }} />
        <rect
          x="242"
          y="79"
          width="102"
          height="15"
          rx="3"
          style={{ fill: 'var(--green)', stroke: 'var(--edge)', strokeWidth: '2.5' }}
        />
        <rect x="249" y="83" width="91" height="7" style={{ fill: 'var(--sheet,#FFFFFF)' }} />
        <path d="M252 86.5H337" style={{ stroke: 'var(--rule)', strokeWidth: '1' }} />
        <rect
          x="256"
          y="65"
          width="82"
          height="14"
          rx="3"
          style={{ fill: 'var(--red)', stroke: 'var(--edge)', strokeWidth: '2.5' }}
        />
        <rect x="263" y="69" width="71" height="6" style={{ fill: 'var(--sheet,#FFFFFF)' }} />
        <path d="M266 72.0H331" style={{ stroke: 'var(--rule)', strokeWidth: '1' }} />
        <rect
          x="264"
          y="52"
          width="64"
          height="13"
          rx="3"
          style={{ fill: 'var(--t-note-bg)', stroke: 'var(--edge)', strokeWidth: '2.5' }}
        />
        <rect x="271" y="56" width="53" height="5" style={{ fill: 'var(--sheet,#FFFFFF)' }} />
        <path d="M274 58.5H321" style={{ stroke: 'var(--rule)', strokeWidth: '1' }} />
        <path
          d="M204 138L248 52M218 140L261 54M210.2 126.0L224.0 128.0M216.8 113.1L230.5 115.1M223.4 100.2L236.9 102.2M230.0 87.3L243.4 89.3M236.6 74.4L249.8 76.4M243.2 61.5L256.3 63.5"
          style={{ fill: 'none', stroke: 'var(--edge)', strokeWidth: '6', strokeLinecap: 'round' }}
        />
        <path
          d="M204 138L248 52M218 140L261 54M210.2 126.0L224.0 128.0M216.8 113.1L230.5 115.1M223.4 100.2L236.9 102.2M230.0 87.3L243.4 89.3M236.6 74.4L249.8 76.4M243.2 61.5L256.3 63.5"
          style={{ fill: 'none', stroke: '#FBF8F1', strokeWidth: '2.6', strokeLinecap: 'round' }}
        />
        <path
          d="M282 41v7c0 2.6 6 4 14 4s14-1.4 14-4v-7z"
          style={{ fill: '#14201F', stroke: 'var(--edge)', strokeWidth: '2' }}
        />
        <path
          d="M296 27 328 37 296 47 264 37z"
          style={{
            fill: '#14201F',
            stroke: 'var(--edge)',
            strokeWidth: '2',
            strokeLinejoin: 'round',
          }}
        />
        <path
          d="M296 37 318 40V50"
          style={{ fill: 'none', stroke: 'var(--sun)', strokeWidth: '2', strokeLinecap: 'round' }}
        />
        <circle cx="296" cy="37" r="2.2" style={{ fill: 'var(--sun)' }} />
        <rect
          x="315.5"
          y="49"
          width="5"
          height="8"
          rx="1.5"
          style={{ fill: 'var(--sun)', stroke: 'var(--edge)', strokeWidth: '1.5' }}
        />
      </g>
      <path
        className="h2"
        d="M0 170V140C200 126 400 124 600 132C780 139 900 136 1060 139C1200 142 1320 134 1440 132V170Z"
      />
      <path className="h3" d="M0 170V156C240 148 480 146 720 151C960 156 1200 149 1440 152V170Z" />
    </svg>
  );
}
