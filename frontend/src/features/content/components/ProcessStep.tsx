import {
  FireIcon,
  GlazeIcon,
  ThrowIcon,
  WedgeIcon,
} from "@/components/icons/pottery";

// The four stages always arrive in this order from the CMS.
const ICONS = [WedgeIcon, ThrowIcon, FireIcon, GlazeIcon];

export interface ProcessStepProps {
  index: number;
  title: string;
  body: string;
}

export function ProcessStep({ index, title, body }: ProcessStepProps) {
  const Icon = ICONS[index % ICONS.length] ?? WedgeIcon;
  return (
    <li className="flex flex-col gap-2 border-t border-ash pt-5">
      <Icon className="size-8 text-ink" />
      <h3 className="text-base">{title}</h3>
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        {body}
      </p>
    </li>
  );
}
