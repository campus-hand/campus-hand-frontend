/**
 * The invite-your-coursemates reward (decided 27 Oct 2026):
 * every 5 verified friends = 1 free week of Pro for the inviter, repeating;
 * the friend gets 2 days of Pro; 20 friends unlocks a month and the
 * Class builder badge.
 */
export class ReferralProgram {
  constructor(
    readonly friendsPerFreeWeek = 5,
    readonly friendBonusDays = 2,
    readonly classBuilderFriends = 20,
  ) {}

  /** Free Pro weeks earned for a number of verified friends. */
  weeksEarned(verifiedFriends: number): number {
    return Math.floor(Math.max(0, verifiedFriends) / this.friendsPerFreeWeek);
  }

  hasClassBuilderBadge(verifiedFriends: number): boolean {
    return verifiedFriends >= this.classBuilderFriends;
  }

  /** "5 coursemates = 1 free week of Pro" */
  get headlineRule(): string {
    return `${this.friendsPerFreeWeek} coursemates = 1 free week of Pro`;
  }

  get friendReward(): string {
    return `${this.friendBonusDays} days of Pro`;
  }
}
