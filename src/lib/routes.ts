/**
 * Every internal link in one place, so pages that do not exist yet are easy
 * to find and wire up later. Unbuilt routes land on the "coming soon" page
 * (src/app/not-found.tsx).
 */
export class SiteRoutes {
  static readonly home = '/';
  static readonly signup = '/signup';
  static readonly verifyEmail = '/signup/verify';
  static readonly login = '/login';
  static readonly otherDevice = '/login/other-device';
  static readonly forgotPassword = '/forgot-password';
  static readonly resetPassword = '/forgot-password/reset';
  static readonly courseUnits = '/course-units';
  /** The signed-in student's dashboard. */
  static readonly appHome = '/home';
  /** Campus assistant (Magezi chat for campus questions). */
  static readonly ask = '/ask';
  static readonly shelf = '/shelf';
  static readonly studyPlan = '/plan';
  static readonly notifications = '/notifications';
  static courseUnit(id: string): string {
    return `/course-units/${encodeURIComponent(id)}`;
  }
  static reader(resourceId: string): string {
    return `/read/${encodeURIComponent(resourceId)}`;
  }
  static quiz(topicId: string): string {
    return `/quiz/${encodeURIComponent(topicId)}`;
  }
  static tutor(id: string): string {
    return `/tutors/${encodeURIComponent(id)}`;
  }
  static readonly pastPapers = '/past-papers';
  static readonly notes = '/notes';
  static readonly magezi = '/magezi';
  static readonly research = '/research';
  static readonly tutors = '/tutors';
  static readonly blog = '/blog';
  static readonly help = '/help';
  static readonly upload = '/upload';
  static readonly becomeTutor = '/tutors/apply';
  static readonly lecturers = '/lecturers';
  static readonly invite = '/invite';
  static readonly about = '/about';
  static readonly pro = '/pro';
  static readonly universities = '/universities';
  static readonly report = '/report';
  static readonly terms = '/terms';
  static readonly privacy = '/privacy';
}
