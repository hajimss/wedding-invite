import { getAllRsvps } from '@/lib/kv'

export const dynamic = 'force-dynamic'

export default async function AdminRsvpPage() {
  const rsvps = await getAllRsvps()
  const attending = rsvps.filter((r) => r.attendance === 'attending')
  const notAttending = rsvps.filter((r) => r.attendance === 'not-attending')
  const totalPax = attending.reduce((sum, r) => sum + r.pax, 0)

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-serif text-stone-800 mb-1">RSVP Responses</h1>
        <p className="text-sm text-stone-500 mb-6">
          {rsvps.length} responses &middot; {totalPax} guests &middot; {attending.length} attending &middot; {notAttending.length} not attending
        </p>

        {rsvps.length === 0 ? (
          <p className="text-stone-400 text-sm">No responses yet.</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-100 text-stone-500 text-xs uppercase tracking-wider text-left">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Pax</th>
                  <th className="px-4 py-3">Wish / Message</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {rsvps.map((rsvp) => (
                  <tr key={rsvp.id} className="border-t border-stone-100">
                    <td className="px-4 py-3 font-medium text-stone-800">{rsvp.name}</td>
                    <td className="px-4 py-3">
                      {rsvp.attendance === 'attending' ? (
                        <span className="text-[#6d8f78] font-medium">✓ Attending</span>
                      ) : (
                        <span className="text-[#c0a08a] font-medium">✗ Not attending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {rsvp.attendance === 'attending' ? rsvp.pax : '—'}
                    </td>
                    <td className="px-4 py-3 text-stone-500 max-w-xs truncate">
                      {rsvp.wish || '—'}
                    </td>
                    <td className="px-4 py-3 text-stone-400 text-xs whitespace-nowrap">
                      {new Date(rsvp.submittedAt).toLocaleString('en-SG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Asia/Singapore',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
