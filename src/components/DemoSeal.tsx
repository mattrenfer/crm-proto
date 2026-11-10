/** The points of the starburst: outer and inner corners, taking turns around a circle. */
function starburstPoints(spikes: number, outer: number, inner: number) {
    return Array.from({ length: spikes * 2 }, (_, i) => {
        const radius = i % 2 === 0 ? outer : inner
        const angle = (Math.PI * i) / spikes
        return `${(radius * Math.cos(angle)).toFixed(1)},${(radius * Math.sin(angle)).toFixed(1)}`
    }).join(' ')
}

/**
 * The starburst on the signed-out pages. Visitors who aren't ready to sign up click it to look around.
 *
 * It's a plain form, so it works even before JavaScript loads. The server does the sign-in (/api/demo).
 * The colors come from the theme tokens, so it follows light and dark mode.
 */
export default function DemoSeal() {
    return (
        <form action="/api/demo" method="post" className="flex-none">
            <button
                type="submit"
                aria-label="Try the demo"
                className="block rounded-full rotate-[7deg] cursor-pointer drop-shadow-md motion-safe:transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
                <svg viewBox="-104 -104 208 208" aria-hidden="true" className="block size-32 sm:size-46">
                    <polygon points={starburstPoints(18, 102, 86)} className="fill-accent" />
                    <circle r="74" strokeWidth="1.5" strokeDasharray="3 4" className="fill-none stroke-on-accent" />
                    {/* The hand icon is from Lucide (ISC license) */}
                    <svg
                        x="-20"
                        y="-60"
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="fill-none stroke-on-accent"
                    >
                        <path d="M18 11V6a2 2 0 0 0-4 0" />
                        <path d="M14 10V4a2 2 0 0 0-4 0v2" />
                        <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
                        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                    </svg>
                    <text y="6" fontSize="30" textAnchor="middle" className="font-display fill-on-accent">
                        Try the
                    </text>
                    <text y="40" fontSize="34" textAnchor="middle" className="font-display fill-on-accent">
                        demo
                    </text>
                </svg>
            </button>
        </form>
    )
}
