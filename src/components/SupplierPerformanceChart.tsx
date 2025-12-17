import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { PurchaseOrder, SupplierType } from '@/lib/types'

interface SupplierPerformanceChartProps {
  title: string
  data: PurchaseOrder[]
  supplier: SupplierType | 'all'
  metricType: 'delivery' | 'cost' | 'accuracy'
}

export function SupplierPerformanceChart({ title, data, supplier, metricType }: SupplierPerformanceChartProps) {
  const chartData = useMemo(() => {
    const monthlyData = new Map<string, {
      month: string
      ssactivewear?: number
      sanmar?: number
      combined?: number
      count: number
    }>()

    data.forEach(po => {
      const date = new Date(po.orderDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthLabel,
          ssactivewear: 0,
          sanmar: 0,
          combined: 0,
          count: 0,
        })
      }

      const entry = monthlyData.get(monthKey)!

      if (metricType === 'delivery') {
        if (po.actualDeliveryDate && po.orderDate) {
          const ordered = new Date(po.orderDate)
          const delivered = new Date(po.actualDeliveryDate)
          const days = Math.floor((delivered.getTime() - ordered.getTime()) / (1000 * 60 * 60 * 24))
          
          if (supplier === 'all') {
            entry[po.supplier] = ((entry[po.supplier] || 0) * entry.count + days) / (entry.count + 1)
            entry.combined = ((entry.combined || 0) * entry.count + days) / (entry.count + 1)
          } else if (supplier === po.supplier) {
            entry[po.supplier] = ((entry[po.supplier] || 0) * entry.count + days) / (entry.count + 1)
          }
          entry.count++
        }
      } else if (metricType === 'cost') {
        if (supplier === 'all') {
          entry[po.supplier] = (entry[po.supplier] || 0) + po.total
          entry.combined = (entry.combined || 0) + po.total
        } else if (supplier === po.supplier) {
          entry[po.supplier] = (entry[po.supplier] || 0) + po.total
        }
        entry.count++
      } else if (metricType === 'accuracy') {
        if (po.accuracyRating !== undefined) {
          if (supplier === 'all') {
            entry[po.supplier] = ((entry[po.supplier] || 0) * entry.count + po.accuracyRating) / (entry.count + 1)
            entry.combined = ((entry.combined || 0) * entry.count + po.accuracyRating) / (entry.count + 1)
          } else if (supplier === po.supplier) {
            entry[po.supplier] = ((entry[po.supplier] || 0) * entry.count + po.accuracyRating) / (entry.count + 1)
          }
          entry.count++
        }
      }
    })

    return Array.from(monthlyData.values())
      .sort((a, b) => {
        const [yearA, monthA] = a.month.split(' ')
        const [yearB, monthB] = b.month.split(' ')
        return new Date(`${monthA} 1, ${yearA}`).getTime() - new Date(`${monthB} 1, ${yearB}`).getTime()
      })
      .slice(-6)
  }, [data, supplier, metricType])

  const formatValue = (value: number) => {
    if (metricType === 'cost') {
      return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    } else if (metricType === 'delivery') {
      return `${Math.round(value)} days`
    } else {
      return `${Math.round(value)}%`
    }
  }

  const ChartComponent = metricType === 'cost' ? BarChart : LineChart

  return (
    <Card className="p-6 border-border bg-card">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.016 249)" />
          <XAxis 
            dataKey="month" 
            stroke="oklch(0.65 0.008 249)"
            fontSize={12}
          />
          <YAxis 
            stroke="oklch(0.65 0.008 249)"
            fontSize={12}
            tickFormatter={(value) => {
              if (metricType === 'cost') return `$${(value / 1000).toFixed(0)}k`
              if (metricType === 'delivery') return `${value}d`
              return `${value}%`
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'oklch(0.22 0.013 249)',
              border: '1px solid oklch(0.3 0.016 249)',
              borderRadius: '8px',
              color: 'oklch(0.96 0.003 249)',
            }}
            formatter={(value: number) => formatValue(value)}
          />
          {supplier === 'all' && (
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => {
                if (value === 'ssactivewear') return 'S&S Activewear'
                if (value === 'sanmar') return 'SanMar'
                return value
              }}
            />
          )}
          {supplier === 'all' ? (
            <>
              {metricType === 'cost' ? (
                <>
                  <Bar dataKey="ssactivewear" fill="oklch(0.7 0.17 166)" name="S&S Activewear" />
                  <Bar dataKey="sanmar" fill="oklch(0.78 0.15 166)" name="SanMar" />
                </>
              ) : (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="ssactivewear" 
                    stroke="oklch(0.7 0.17 166)" 
                    strokeWidth={2}
                    dot={{ fill: 'oklch(0.7 0.17 166)', r: 4 }}
                    name="S&S Activewear"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sanmar" 
                    stroke="oklch(0.78 0.15 166)" 
                    strokeWidth={2}
                    dot={{ fill: 'oklch(0.78 0.15 166)', r: 4 }}
                    name="SanMar"
                  />
                </>
              )}
            </>
          ) : (
            <>
              {metricType === 'cost' ? (
                <Bar dataKey={supplier} fill="oklch(0.7 0.17 166)" />
              ) : (
                <Line 
                  type="monotone" 
                  dataKey={supplier} 
                  stroke="oklch(0.7 0.17 166)" 
                  strokeWidth={2}
                  dot={{ fill: 'oklch(0.7 0.17 166)', r: 4 }}
                />
              )}
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </Card>
  )
}
