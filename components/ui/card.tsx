import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// Mobile-optimized admin card for displaying list items
const AdminMobileCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string;
    subtitle?: string;
    badge?: React.ReactNode;
    actions?: React.ReactNode;
    details?: Array<{ label: string; value: React.ReactNode }>;
  }
>(({ className, title, subtitle, badge, actions, details, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      "p-4 hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20",
      className
    )}
    {...props}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-gray-900 truncate">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center space-x-2 ml-3">
        {badge}
        {actions}
      </div>
    </div>
    
    {details && details.length > 0 && (
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
        {details.map((detail, index) => (
          <div key={index} className="min-w-0">
            <dt className="text-xs font-medium text-gray-500 mb-1">
              {detail.label}
            </dt>
            <dd className="text-sm text-gray-900 truncate">
              {detail.value}
            </dd>
          </div>
        ))}
      </div>
    )}
  </Card>
));
AdminMobileCard.displayName = "AdminMobileCard";

// Compact stat card for mobile dashboards
const StatCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: "up" | "down" | "neutral";
    action?: React.ReactNode;
  }
>(({ className, icon, title, value, subtitle, trend, action, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      "p-4 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1",
      className
    )}
    {...props}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  </Card>
));
StatCard.displayName = "StatCard";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, AdminMobileCard, StatCard };
