import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { SiteRoutes } from '@/lib/routes';
import { landingContent } from '../content/landing-content';
import { ShareActions } from './share-actions';

export function InviteBand() {
  const { invite } = landingContent;
  const { chat } = invite;

  return (
    <section
      aria-labelledby="rb-h"
      className="border-edge bg-forest text-on-forest mt-24 border-y-[2.5px]"
    >
      <div className="wrap grid items-center gap-14 pt-20 pb-11 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-[22px]">
          <span className="sticker display text-[22px]">{invite.program.headlineRule}</span>
          <h2 id="rb-h" className="display text-[clamp(52px,6vw,84px)]">
            {invite.title}
          </h2>
          <p className="max-w-[46ch] text-lg">{invite.lead}</p>
          <ShareActions withSms size="lg" />
          <Link
            href={SiteRoutes.invite}
            className="underline-link inline-flex min-h-11 items-center gap-2 text-base font-bold"
          >
            {invite.ownLink}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="relative flex flex-col items-start gap-8 sm:block sm:min-h-[470px]">
          <figure
            aria-label="Example: a Campus Hand link shared in a class WhatsApp group"
            className="bg-paper text-ink relative flex w-full -rotate-[1.5deg] flex-col gap-2.5 rounded-[20px] p-3.5 shadow-[inset_0_0_0_2.5px_var(--edge),5px_5px_0_var(--drop)] sm:absolute sm:top-0 sm:left-0 sm:w-[min(380px,72%)]"
          >
            <figcaption className="border-rule flex items-center gap-2.5 border-b pb-2.5">
              <span className="display bg-cobalt text-on-cobalt grid size-10 flex-none place-items-center rounded-full text-base shadow-[inset_0_0_0_2px_var(--edge)]">
                CS
              </span>
              <span className="min-w-0">
                <b className="block text-[15px]">{chat.group}</b>
                <span className="text-mute text-[12.5px]">{chat.members}</span>
              </span>
            </figcaption>
            <div className="bg-daily-bg max-w-[88%] self-end rounded-2xl rounded-br-[5px] px-[11px] py-[9px] text-[14.5px] leading-[1.4] shadow-[inset_0_0_0_1.5px_var(--edge)]">
              <span className="bg-surface mb-2 flex items-center gap-2.5 rounded-xl p-2 shadow-[inset_0_0_0_1.5px_var(--edge)]">
                <Image
                  src="/brand/campus-hand-logo.svg"
                  alt=""
                  width={52}
                  height={52}
                  unoptimized
                  className="block flex-none rounded-xl"
                />
                <span>
                  <b className="block text-[13.5px] leading-[1.3]">{chat.previewTitle}</b>
                  <span className="text-mute block text-xs">{chat.previewNote}</span>
                  <span className="text-mute block text-xs">campushand.com</span>
                </span>
              </span>
              {chat.message}
              <span className="text-mute mt-0.5 block text-right text-[11.5px]">{chat.time}</span>
            </div>
            {chat.replies.map((reply) => (
              <div
                key={reply.who}
                className="bg-surface max-w-[88%] self-start rounded-2xl rounded-bl-[5px] px-[11px] py-[9px] text-[14.5px] leading-[1.4] shadow-[inset_0_0_0_1.5px_var(--edge)]"
              >
                <span
                  className={`mb-0.5 block text-[12.5px] font-bold ${reply.tone === 'red' ? 'text-red-text' : 'text-link'}`}
                >
                  {reply.who}
                </span>
                {reply.text}
              </div>
            ))}
          </figure>

          <div className="bg-paper text-ink flex w-[186px] rotate-2 flex-col gap-2 self-end rounded-[18px] p-3.5 shadow-[inset_0_0_0_2.5px_var(--edge),4px_4px_0_var(--drop)] sm:absolute sm:right-[-8px] sm:bottom-[-14px]">
            <Image
              src="/brand/qr-campushand.svg"
              alt="QR code for Campus Hand"
              width={158}
              height={158}
              unoptimized
              className="block h-auto w-full rounded-xl bg-white p-2.5 shadow-[inset_0_0_0_2px_#14201F]"
            />
            <p className="text-[14.5px] leading-[1.3] font-bold">{invite.qr.title}</p>
            <p className="text-mute text-[13px]">{invite.qr.body}</p>
          </div>
        </div>
      </div>

      <div className="wrap pb-[76px]">
        <ol className="grid gap-2.5 md:grid-cols-3">
          {invite.steps.map((step, index) => (
            <li
              key={step.title}
              className="bg-paper text-ink flex items-start gap-3 rounded-2xl p-3.5 shadow-[inset_0_0_0_2px_var(--edge)]"
            >
              <span
                className="display bg-sun text-on-sun grid size-[34px] flex-none place-items-center rounded-[10px] text-xl shadow-[inset_0_0_0_2px_var(--edge)]"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span>
                <b className="block text-[15.5px]">{step.title}</b>
                <span className="text-mute block text-[13.5px]">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
