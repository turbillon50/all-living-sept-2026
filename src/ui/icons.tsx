/**
 * Familia única de íconos de ALL LIVING: Phosphor en peso duotone.
 * Nada de trazo genérico. Los nombres son los que usa la app; aquí se mapean a Phosphor
 * para que cambiar de familia sea un solo archivo.
 */
import type { ComponentType } from "react";
import type { IconProps, IconWeight } from "@phosphor-icons/react";
import * as P from "@phosphor-icons/react/dist/ssr";

export type { IconProps };
export type Icon = ComponentType<IconProps>;
export type LucideIcon = Icon;

const WEIGHT: IconWeight = "duotone";

function withWeight(Base: Icon, weight: IconWeight = WEIGHT): Icon {
  const Wrapped = (props: IconProps) => <Base weight={weight} {...props} />;
  Wrapped.displayName = Base.displayName ?? "Icon";
  return Wrapped;
}

export const ArrowRight = withWeight(P.ArrowRight, "bold"); // glifo de navegación, no duotone
export const Baby = withWeight(P.Baby);
export const BadgeCheck = withWeight(P.SealCheck);
export const Bell = withWeight(P.Bell);
export const Briefcase = withWeight(P.Briefcase);
export const Building2 = withWeight(P.Buildings);
export const CalendarCheck = withWeight(P.CalendarCheck);
export const CalendarDays = withWeight(P.CalendarDots);
export const Car = withWeight(P.Car);
export const Check = withWeight(P.Check, "bold"); // glifo de navegación, no duotone
export const ChefHat = withWeight(P.ChefHat);
export const ChevronLeft = withWeight(P.CaretLeft, "bold"); // glifo de navegación, no duotone
export const ChevronRight = withWeight(P.CaretRight, "bold"); // glifo de navegación, no duotone
export const Compass = withWeight(P.Compass);
export const ConciergeBell = withWeight(P.CallBell);
export const Gift = withWeight(P.Gift);
export const HeartPulse = withWeight(P.Heartbeat);
export const HelpCircle = withWeight(P.Question);
export const Home = withWeight(P.House);
export const IdCard = withWeight(P.IdentificationCard);
export const Info = withWeight(P.Info);
export const KeyRound = withWeight(P.Key);
export const LifeBuoy = withWeight(P.Lifebuoy);
export const ListChecks = withWeight(P.ListChecks);
export const MapPin = withWeight(P.MapPin);
export const MessageCircle = withWeight(P.ChatCircle);
export const MoreHorizontal = withWeight(P.DotsThree, "bold"); // glifo de navegación, no duotone
export const PartyPopper = withWeight(P.Confetti);
export const Phone = withWeight(P.Phone);
export const Repeat = withWeight(P.Repeat);
export const Settings = withWeight(P.GearSix);
export const ShieldCheck = withWeight(P.ShieldCheck);
export const Ship = withWeight(P.Boat);
export const ShoppingBasket = withWeight(P.Basket);
export const Siren = withWeight(P.Siren);
export const SlidersHorizontal = withWeight(P.SlidersHorizontal);
export const Sparkles = withWeight(P.Sparkle);
export const Star = withWeight(P.Star);
export const Tag = withWeight(P.Tag);
export const UserRound = withWeight(P.User);
export const Users = withWeight(P.Users);
export const Wallet = withWeight(P.Wallet);
export const Wrench = withWeight(P.Wrench);
