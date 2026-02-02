export default function ContactPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-12 px-6 py-16">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-amber-900">Get in Touch</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-700">
          Planning a trip, need help tailoring an experience, or curious about partnering with Vivana?
          Drop us a line and our local team will respond within 24 hours.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <section className="space-y-6 rounded-3xl bg-white p-8 ring-1 ring-black">
          <div>
            <h2 className="text-xl font-semibold text-amber-800">Visit or message us</h2>
            <p className="mt-2 text-sm text-stone-600">
              Rua do Loreto 45, 1200-241 Lisbon, Portugal
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-600">
              Email
            </h3>
            <p className="mt-1 text-stone-600">info@vivana.pt</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-600">
              Phone & WhatsApp
            </h3>
            <p className="mt-1 text-stone-600">+351 912 345 678</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-600">
              Hours
            </h3>
            <p className="mt-1 text-stone-600">Monday - Saturday, 9:00 - 18:00 WET</p>
          </div>
        </section>

        <form className="space-y-5 rounded-3xl bg-white p-8 ring-1 ring-black">
          <h2 className="text-xl font-semibold text-amber-800">Send us a message</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-stone-700">
              First name
              <input
                type="text"
                name="firstName"
                required
                className="mt-1 w-full rounded-lg border border-black px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/30"
              />
            </label>
            <label className="text-sm font-medium text-stone-700">
              Last name
              <input
                type="text"
                name="lastName"
                required
                className="mt-1 w-full rounded-lg border border-black px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/30"
              />
            </label>
          </div>
          <label className="text-sm font-medium text-stone-700">
            Email
            <input
              type="email"
              name="email"
              required
              className="mt-1 w-full rounded-lg border border-black px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/30"
            />
          </label>
          <label className="text-sm font-medium text-stone-700">
            Phone number
            <input
              type="tel"
              name="phone"
              className="mt-1 w-full rounded-lg border border-black px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/30"
              placeholder="+351 912 345 678"
            />
          </label>
          <label className="text-sm font-medium text-stone-700">
            How can we help?
            <textarea
              name="message"
              rows={4}
              required
              className="mt-1 w-full rounded-lg border border-black px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/30"
              placeholder="Tell us about the experience you'd like to create..."
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-full bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            Send message
          </button>
        </form>
      </div>
    </div>
  );
}
