import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const BreadCrumb = ({ breadCrumbData }) => {
  if (!breadCrumbData || breadCrumbData.length === 0) return null;

  return (
    <Breadcrumb className="mb-5">
      <BreadcrumbList className="flex flex-wrap gap-1 text-sm sm:text-base">
        {breadCrumbData.map((data, i) => {
          const isLast = i === breadCrumbData.length - 1
          return (
            <div key={i} className="flex items-center">
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={data.href}
                  className={`hover:text-blue-600 transition-colors ${
                    isLast ? 'font-semibold text-gray-700' : 'text-gray-500'
                  }`}
                >
                  {data.label}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="mx-1 text-gray-400" />}
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default BreadCrumb
