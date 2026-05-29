"use client";

import * as React from "react";
import * as RadixAccordion from "@radix-ui/react-accordion";
import { FiChevronDown } from "react-icons/fi";
import clsx from "clsx";

export const Accordion = RadixAccordion.Root;

export const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
  <RadixAccordion.Item
    ref={ref}
    className={clsx("border-b border-zinc-100 dark:border-white/5", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

export const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <RadixAccordion.Header className="flex">
    <RadixAccordion.Trigger
      ref={ref}
      className={clsx(
        "flex flex-1 items-center justify-between py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-zinc-500 dark:text-zinc-400 dark:hover:text-white [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <FiChevronDown className="h-4 w-4 shrink-0 transition-transform duration-300 text-zinc-400" />
    </RadixAccordion.Trigger>
  </RadixAccordion.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";

export const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <RadixAccordion.Content
    ref={ref}
    className={clsx(
      "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      className
    )}
    {...props}
  >
    <div className="pb-6 pt-0">{children}</div>
  </RadixAccordion.Content>
));
AccordionContent.displayName = "AccordionContent";