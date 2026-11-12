import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { previewPosts } from '../content/preview-posts';
import { relatedPosts } from '../models/campus-post';
import { CampusScreen } from './campus-screen';
import { PostScreen } from './post-screen';

describe('CampusScreen', () => {
  it('features the newest post and lists the rest', () => {
    render(<CampusScreen posts={previewPosts} category={null} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Campus' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Paying for a retake, step by step' })).toHaveAttribute(
      'href',
      '/blog/paying-for-a-retake',
    );
    expect(screen.getByText('Checked against the official fees guide')).toBeInTheDocument();
    const more = screen.getByRole('region', { name: 'More posts' });
    expect(within(more).getAllByRole('article')).toHaveLength(6);
    expect(within(more).getByRole('link', { name: /Lunch under UGX 5,000/ })).toHaveAttribute(
      'href',
      '/blog/lunch-under-5000',
    );
    expect(screen.getByRole('link', { name: /Write/ })).toHaveAttribute('href', '/blog/write');
  });

  it('marks the chosen topic and shows only its posts', () => {
    render(<CampusScreen posts={previewPosts} category="Fees" />);
    const topics = screen.getByRole('navigation', { name: 'Topics' });
    expect(within(topics).getByRole('link', { name: 'Fees' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(topics).getByRole('link', { name: 'All' })).not.toHaveAttribute('aria-current');
    expect(within(topics).getByRole('link', { name: 'Hostels' })).toHaveAttribute(
      'href',
      '/blog?topic=hostels',
    );
    const more = screen.getByRole('region', { name: 'More posts' });
    expect(within(more).getAllByRole('article')).toHaveLength(1);
    expect(within(more).getByText(/instalments/)).toBeInTheDocument();
  });

  it('invites a first post when a topic is empty', () => {
    render(<CampusScreen posts={previewPosts.slice(0, 2)} category="Events" />);
    expect(screen.getByRole('heading', { name: 'No Events posts yet' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Write a post' })).toBeInTheDocument();
  });
});

describe('PostScreen', () => {
  it('shows the post, who wrote it, what it was checked against, and what to read next', () => {
    const [retake] = previewPosts;
    render(<PostScreen post={retake} next={relatedPosts(previewPosts, retake)} />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Paying for a retake, step by step' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Namusoke Joan')).toBeInTheDocument();
    expect(screen.getByText('10 November 2026')).toHaveAttribute('datetime', '2026-11-10');
    expect(screen.getByText('Checked against the official fees guide')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'The route that takes a day' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByText(/Pay with the reference on your form/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Fees' })).toHaveAttribute('href', '/blog?topic=fees');
    expect(screen.getByRole('link', { name: 'Back to Campus' })).toHaveAttribute('href', '/blog');
    expect(screen.getByRole('link', { name: 'Report a problem' })).toHaveAttribute(
      'href',
      '/report',
    );

    const next = screen.getByRole('region', { name: 'Read next' });
    const links = within(next).getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/blog/tuition-in-instalments');
    expect(links).toHaveLength(3);
  });
});
