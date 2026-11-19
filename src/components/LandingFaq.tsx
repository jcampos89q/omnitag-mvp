'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'

export default function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const { dict } = useTranslation()

  const faqs = dict.faqSection.items

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index
        return (
          <div
            key={index}
            className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
              isOpen 
                ? 'border-gray-900 bg-white shadow-md' 
                : 'border-gray-200 bg-white/70 hover:bg-white hover:border-gray-300'
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 shrink-0">
                  {faq.badge || 'FAQ'}
                </span>
                <span className="font-extrabold text-sm sm:text-base text-gray-950">
                  {faq.q}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-black' : ''
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/40">
                {faq.a}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
