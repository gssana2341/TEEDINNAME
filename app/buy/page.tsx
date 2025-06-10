import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Buy Properties - Tedin Easy',
  description: 'Find properties for sale with Tedin Easy',
}

export default function BuyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Properties for Sale</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Property listings will go here */}
        <p>Properties for sale will be displayed here.</p>
      </div>
    </div>
  )
}
