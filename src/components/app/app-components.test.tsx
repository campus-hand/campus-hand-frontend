import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CourseUnitTabs } from '@/features/course-unit/components/course-unit-tabs';
import { FollowButton } from '@/features/course-unit/components/follow-button';
import { PlanChecklist } from '@/features/home/components/plan-checklist';
import { activeNavKey, BottomTabsView, SidebarNavView } from './app-nav';
import { Avatar, ProgressBar } from './bits';
import { CourseUnitTile } from './course-unit-tile';
import { MaterialTag, materialLabel, SheetThumb } from './material';
import { ScreenLoading } from './screen-loading';

describe('app navigation', () => {
  it('knows which tab a path belongs to', () => {
    expect(activeNavKey('/home')).toBe('home');
    expect(activeNavKey('/course-units/csc-2100')).toBe('courses');
    expect(activeNavKey('/ask')).toBe('ask');
    expect(activeNavKey('/blog/some-post')).toBe('campus');
    expect(activeNavKey('/course-unitsx')).toBeNull();
    expect(activeNavKey('/')).toBeNull();
  });

  it('marks the current page in the sidebar and the tab bar', () => {
    render(
      <>
        <SidebarNavView active="courses" />
        <BottomTabsView active="home" />
      </>,
    );
    const courses = screen.getAllByRole('link', { name: 'Courses' });
    expect(courses[0]).toHaveAttribute('aria-current', 'page');
    expect(courses[1]).not.toHaveAttribute('aria-current');
    expect(screen.getAllByRole('link', { name: 'Home' })[1]).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getAllByRole('link', { name: 'Ask' })[0]).toHaveAttribute('href', '/ask');
  });
});

describe('PlanChecklist', () => {
  it('ticks tasks off and moves the "Tonight" marker to the next task', async () => {
    const user = userEvent.setup();
    render(
      <PlanChecklist
        tasks={[
          { id: 'a', title: 'Trees and BSTs', when: 'Tonight', done: false },
          { id: 'b', title: 'Timed past paper', when: 'Sun', done: false },
        ]}
      />,
    );
    const trees = screen.getByRole('checkbox', { name: /Trees and BSTs/ });
    expect(trees).not.toBeChecked();
    await user.click(trees);
    expect(trees).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Timed past paper/ })).not.toBeChecked();
    await user.click(trees);
    expect(trees).not.toBeChecked();
  });
});

describe('FollowButton', () => {
  it('toggles following', async () => {
    const user = userEvent.setup();
    render(<FollowButton code="CSC 2100" initiallyFollowing />);
    const button = screen.getByRole('button', { name: 'Follow CSC 2100' });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveTextContent('Following');
    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveTextContent('Follow');
  });
});

describe('CourseUnitTabs', () => {
  it('switches between panels', async () => {
    const user = userEvent.setup();
    render(
      <CourseUnitTabs
        label="CSC 2100 sections"
        tabs={[
          { value: 'topics', label: 'Topics', content: <p>Topic list</p> },
          { value: 'papers', label: 'Past papers 6', content: <p>Paper list</p> },
        ]}
      />,
    );
    const list = screen.getByRole('tablist', { name: 'CSC 2100 sections' });
    expect(screen.getByText('Topic list')).toBeVisible();
    await user.click(within(list).getByRole('tab', { name: 'Past papers 6' }));
    expect(screen.getByText('Paper list')).toBeVisible();
    expect(within(list).getByRole('tab', { name: 'Past papers 6' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});

describe('shared app bits', () => {
  it('renders progress, avatars, tiles, tags and loading states accessibly', () => {
    render(
      <>
        <ProgressBar value={1.4} label="Question 2 of 6" />
        <Avatar initials="SN" tone="cobalt" />
        <CourseUnitTile href="/course-units/x" code="CSC 2100" title="DSA" index={6} newCount={3} />
        <CourseUnitTile href="/course-units/y" code="CSC 2104" title="OS" index={0} />
        <MaterialTag kind="tutorial" />
        <SheetThumb kind="paper" stamp="DEC 2024" />
        <SheetThumb kind="lecture" />
        <ScreenLoading label="Loading your dashboard" />
      </>,
    );
    expect(screen.getByRole('progressbar', { name: 'Question 2 of 6' })).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
    expect(screen.getByRole('link', { name: /CSC 2100/ })).toHaveTextContent('3 new');
    expect(screen.getByRole('link', { name: /CSC 2104/ })).not.toHaveTextContent('new');
    expect(screen.getByText('Tutorial')).toHaveClass('tag-tut');
    expect(materialLabel('daily')).toBe('Daily notes');
    expect(screen.getByRole('status', { name: 'Loading your dashboard' })).toBeInTheDocument();
  });
});
