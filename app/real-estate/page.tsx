import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Real Estate - Tedin Easy',
  description: 'Browse all real estate listings',
}

export default function RealEstatePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Real Estate</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* All property listings will go here */}
        <p>All real estate listings will be displayed here.</p>
      </div>
    </div>
  )
}
