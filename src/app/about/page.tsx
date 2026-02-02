export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-16">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-amber-800">About Vivana</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-700">
          Vivana was born in Lisbon to connect travelers with the people, flavors, and stories that make Portugal unforgettable.
        </p>
      </header>

      <section className="grid gap-10 md:grid-cols-2">
        <article className="rounded-3xl bg-white p-8 ring-1 ring-black">
          <h2 className="text-2xl font-semibold text-amber-800">Our Mission</h2>
          <p className="mt-4 text-stone-600">
            We believe the best journeys come from genuine encounters. From sunrise surf lessons to soulful fado evenings,
            we design experiences that open doors to the Portuguese way of life.
          </p>
        </article>
        <article className="rounded-3xl bg-white p-8 ring-1 ring-black">
          <h2 className="text-2xl font-semibold text-amber-800">Local Expertise</h2>
          <p className="mt-4 text-stone-600">
            Our network of Lisbon locals, artisans, chefs, and storytellers curate each moment. Every guide is handpicked for their
            knowledge, warmth, and love for their city.
          </p>
        </article>
      </section>

      <section className="rounded-3xl bg-amber-100 p-8 text-center">
        <h2 className="text-2xl font-semibold text-amber-900">Join the Community</h2>
        <p className="mt-3 text-stone-700">
          Whether you&apos;re visiting for the first time or rediscovering your roots, Vivana invites you to slow down, connect,
          and experience Portugal like a local. Ready to start planning?
        </p>
      </section>
    </div>
  );
}
