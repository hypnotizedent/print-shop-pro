import type { ProductType } from '@/lib/types'

interface ProductMockupProps {
  productType: ProductType
  color?: string
  size?: 'small' | 'medium' | 'large'
  showPrintArea?: boolean
  view?: 'front' | 'back'
}

const sizeMap = {
  small: { width: 48, height: 48 },
  medium: { width: 200, height: 250 },
  large: { width: 300, height: 400 },
}

function TShirtSVG({ color, showPrintArea, view }: { color: string; showPrintArea: boolean; view: 'front' | 'back' }) {
  return (
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M30 25L20 15L5 20L10 35L20 30V95C20 98 22 100 25 100H75C78 100 80 98 80 95V30L90 35L95 20L80 15L70 25L65 20H35L30 25Z"
        fill={color}
        stroke="#000"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M35 30C35 30 45 25 50 25C55 25 65 30 65 30"
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {showPrintArea && view === 'front' && (
        <rect
          x="35"
          y="40"
          width="30"
          height="35"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1"
          strokeDasharray="2,2"
          opacity="0.8"
        />
      )}
      {showPrintArea && view === 'back' && (
        <rect
          x="30"
          y="35"
          width="40"
          height="50"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1"
          strokeDasharray="2,2"
          opacity="0.8"
        />
      )}
    </svg>
  )
}

function HoodieSVG({ color, showPrintArea, view }: { color: string; showPrintArea: boolean; view: 'front' | 'back' }) {
  return (
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M30 25L20 15L5 20L10 35L20 30V95C20 98 22 100 25 100H75C78 100 80 98 80 95V30L90 35L95 20L80 15L70 25L65 20H35L30 25Z"
        fill={color}
        stroke="#000"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M40 25V35C40 40 45 42 50 42C55 42 60 40 60 35V25"
        fill={color}
        stroke="#000"
        strokeWidth="1.5"
      />
      <path
        d="M48 42V55"
        stroke="#000"
        strokeWidth="1.2"
      />
      <circle cx="48" cy="60" r="2" fill="#000" />
      <circle cx="48" cy="67" r="2" fill="#000" />
      <circle cx="48" cy="74" r="2" fill="#000" />
      <path
        d="M35 100L40 90L60 90L65 100"
        fill={color}
        stroke="#000"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {showPrintArea && view === 'front' && (
        <rect
          x="30"
          y="45"
          width="40"
          height="35"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1"
          strokeDasharray="2,2"
          opacity="0.8"
        />
      )}
      {showPrintArea && view === 'back' && (
        <rect
          x="25"
          y="35"
          width="50"
          height="50"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1"
          strokeDasharray="2,2"
          opacity="0.8"
        />
      )}
    </svg>
  )
}

function PoloSVG({ color, showPrintArea, view }: { color: string; showPrintArea: boolean; view: 'front' | 'back' }) {
  return (
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M30 25L20 15L5 20L10 35L20 30V95C20 98 22 100 25 100H75C78 100 80 98 80 95V30L90 35L95 20L80 15L70 25L65 20H35L30 25Z"
        fill={color}
        stroke="#000"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M40 25V40L45 45H55L60 40V25"
        fill={color}
        stroke="#000"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M45 25L45 35L50 38L55 35L55 25"
        fill="none"
        stroke="#000"
        strokeWidth="1.2"
      />
      <circle cx="47" cy="30" r="1.5" fill="#000" />
      <circle cx="47" cy="34" r="1.5" fill="#000" />
      {showPrintArea && view === 'front' && (
        <rect
          x="55"
          y="35"
          width="20"
          height="15"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1"
          strokeDasharray="2,2"
          opacity="0.8"
        />
      )}
      {showPrintArea && view === 'back' && (
        <rect
          x="25"
          y="35"
          width="50"
          height="50"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1"
          strokeDasharray="2,2"
          opacity="0.8"
        />
      )}
    </svg>
  )
}

function LongSleeveSVG({ color, showPrintArea, view }: { color: string; showPrintArea: boolean; view: 'front' | 'back' }) {
  return (
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M30 25L15 20L5 25L8 40L12 80L20 95V95C20 98 22 100 25 100H75C78 100 80 98 80 95V95L88 80L92 40L95 25L85 20L70 25L65 20H35L30 25Z"
        fill={color}
        stroke="#000"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M35 30C35 30 45 25 50 25C55 25 65 30 65 30"
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {showPrintArea && view === 'front' && (
        <rect
          x="35"
          y="40"
          width="30"
          height="35"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1"
          strokeDasharray="2,2"
          opacity="0.8"
        />
      )}
      {showPrintArea && view === 'back' && (
        <rect
          x="30"
          y="35"
          width="40"
          height="50"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1"
          strokeDasharray="2,2"
          opacity="0.8"
        />
      )}
    </svg>
  )
}

function TankTopSVG({ color, showPrintArea, view }: { color: string; showPrintArea: boolean; view: 'front' | 'back' }) {
  return (
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M35 20L30 25V95C30 98 32 100 35 100H65C68 100 70 98 70 95V25L65 20H35Z"
        fill={color}
        stroke="#000"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M40 25C40 25 45 22 50 22C55 22 60 25 60 25"
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {showPrintArea && view === 'front' && (
        <rect
          x="35"
          y="35"
          width="30"
          height="40"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1"
          strokeDasharray="2,2"
          opacity="0.8"
        />
      )}
      {showPrintArea && view === 'back' && (
        <rect
          x="32"
          y="30"
          width="36"
          height="50"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1"
          strokeDasharray="2,2"
          opacity="0.8"
        />
      )}
    </svg>
  )
}

function HatSVG({ color, showPrintArea }: { color: string; showPrintArea: boolean }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="65" rx="45" ry="8" fill={color} stroke="#000" strokeWidth="1.5" />
      <path
        d="M15 65C15 65 15 45 25 35C35 25 50 20 50 20C50 20 65 25 75 35C85 45 85 65 85 65"
        fill={color}
        stroke="#000"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M30 50C30 50 35 35 50 35C65 35 70 50 70 50"
        fill="none"
        stroke="#000"
        strokeWidth="1.2"
      />
      <rect x="45" y="22" width="10" height="6" rx="1" fill="#000" />
      {showPrintArea && (
        <rect
          x="35"
          y="40"
          width="30"
          height="15"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1"
          strokeDasharray="2,2"
          opacity="0.8"
        />
      )}
    </svg>
  )
}

function OtherSVG({ color, showPrintArea }: { color: string; showPrintArea: boolean }) {
  return (
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="20" width="60" height="80" rx="4" fill={color} stroke="#000" strokeWidth="1.5" />
      <circle cx="50" cy="60" r="20" fill="none" stroke="#000" strokeWidth="1.5" />
      <path d="M50 40V80M30 60H70" stroke="#000" strokeWidth="1.5" />
      {showPrintArea && (
        <rect
          x="30"
          y="45"
          width="40"
          height="30"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1"
          strokeDasharray="2,2"
          opacity="0.8"
        />
      )}
    </svg>
  )
}

export function ProductMockup({ 
  productType, 
  color = '#94a3b8', 
  size = 'small',
  showPrintArea = false,
  view = 'front'
}: ProductMockupProps) {
  const dimensions = sizeMap[size]
  
  const getSVGComponent = () => {
    switch (productType) {
      case 'tshirt':
        return <TShirtSVG color={color} showPrintArea={showPrintArea} view={view} />
      case 'hoodie':
        return <HoodieSVG color={color} showPrintArea={showPrintArea} view={view} />
      case 'polo':
        return <PoloSVG color={color} showPrintArea={showPrintArea} view={view} />
      case 'hat':
        return <HatSVG color={color} showPrintArea={showPrintArea} />
      default:
        return <OtherSVG color={color} showPrintArea={showPrintArea} />
    }
  }
  
  return (
    <div 
      className="flex-shrink-0" 
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      {getSVGComponent()}
    </div>
  )
}
