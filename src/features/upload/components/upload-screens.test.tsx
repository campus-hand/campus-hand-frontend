import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PreviewCatalogueSource } from '@/features/catalogue/models/preview-catalogue-source';
import type { Placement } from '../models/placement';
import { PreviewUploadSource } from '../models/preview-upload-source';
import { MyUploads, SharingABook } from './upload-rail';
import { UploadForm } from './upload-form';

const profile: Placement = {
  institutionSlug: 'sample',
  programmeId: 'bscs',
  year: 2,
  semester: 1,
  courseUnitId: '',
  topicId: '',
};

function setup(mode: 'member' | 'guest') {
  const user = userEvent.setup();
  render(
    <UploadForm
      mode={mode}
      profile={mode === 'member' ? profile : null}
      currentYear={2026}
      catalogue={new PreviewCatalogueSource()}
      source={new PreviewUploadSource(0, 2)}
    />,
  );
  return user;
}

const pdf = () => new File(['x'.repeat(2048)], 'avl-rotations.pdf', { type: 'application/pdf' });

describe('UploadForm (signed in)', () => {
  it('starts from the profile, then sends a complete upload for review', async () => {
    const user = setup('member');
    expect(await screen.findByRole('option', { name: 'BSc Computer Science' })).toBeInTheDocument();
    expect(screen.getByLabelText('Course (programme)')).toHaveValue('bscs');
    expect(screen.getAllByText('From your profile')).toHaveLength(2);
    expect(screen.getByRole('radio', { name: 'Year 2' })).toHaveAttribute('aria-checked', 'true');

    await user.upload(screen.getByLabelText(/Choose a file/), pdf());
    expect(await screen.findByText(/Uploaded/)).toBeInTheDocument();

    await screen.findByRole('option', { name: /CSC 2100/ });
    await user.selectOptions(screen.getByLabelText('Course unit'), 'csc-2100');
    expect(screen.getByText('Year 2, Semester 1 course units')).toBeInTheDocument();
    await screen.findByRole('option', { name: /Trees and binary search trees/ });
    await user.selectOptions(screen.getByLabelText(/Topic/), 'csc-2100-t4');

    await user.click(screen.getByRole('radio', { name: 'Lecture notes' }));
    await user.type(screen.getByLabelText('Title'), 'AVL rotations, worked examples');
    expect(screen.getByText(/Earn points when it is approved/)).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: /my own notes/ }));
    await user.click(screen.getByRole('button', { name: 'Send for review' }));

    const sent = await screen.findByRole('status');
    expect(within(sent).getByRole('heading', { name: 'Sent for review' })).toHaveFocus();
    expect(within(sent).getByText(/Reference: UP-M/)).toBeInTheDocument();

    await user.click(within(sent).getByRole('button', { name: 'Upload another' }));
    expect(screen.getByLabelText('Title')).toHaveValue('');
    expect(screen.getByLabelText('Course (programme)')).toHaveValue('bscs');
  });

  it('lists what needs fixing and moves focus to the first problem', async () => {
    const user = setup('member');
    await screen.findByRole('option', { name: 'BSc Computer Science' });
    await user.click(screen.getByRole('button', { name: 'Send for review' }));
    expect(screen.getByRole('alert')).toHaveTextContent('5 things need fixing');
    expect(screen.getByLabelText(/Choose a file/)).toHaveFocus();
    expect(screen.getByText('Choose the course unit.')).toBeInTheDocument();
    expect(screen.getByText('Choose what it is.')).toBeInTheDocument();
  });

  it('rejects a file it cannot show and lets it be removed', async () => {
    setup('member');
    // A student can still pick "All files" in the browser's file dialog.
    const user = userEvent.setup({ applyAccept: false });
    await user.upload(
      screen.getByLabelText(/Choose a file/),
      new File(['x'], 'setup.exe', { type: 'application/octet-stream' }),
    );
    expect(screen.getByText(/Choose a PDF, Word or PowerPoint file/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove setup.exe' }));
    expect(screen.getByLabelText(/Choose a file/)).toBeInTheDocument();
  });

  it('asks for the exam on a past paper', async () => {
    const user = setup('member');
    await user.click(screen.getByRole('radio', { name: 'Past paper' }));
    expect(screen.getByText(/Leaked or “predicted” papers are removed/)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '2017' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: '2027' })).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Exam'), 'Supplementary exam');
    expect(screen.getByLabelText('Exam')).toHaveValue('Supplementary exam');
  });
});

describe('UploadForm (guest)', () => {
  it('unlocks the pickers in order', async () => {
    const user = setup('guest');
    expect(screen.getByLabelText('Course (programme)')).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Year 1' })).toBeDisabled();
    expect(screen.queryByText('From your profile')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tell us your university' })).toHaveAttribute(
      'href',
      '/universities',
    );

    await screen.findByRole('option', { name: 'Makerere University' });
    await user.selectOptions(screen.getByLabelText('University'), 'sample');
    await screen.findByRole('option', { name: 'BSc Computer Science' });
    await user.selectOptions(screen.getByLabelText('Course (programme)'), 'bscs');
    // A three-year programme offers three years.
    expect(screen.getAllByRole('radio', { name: /^Year \d$/ })).toHaveLength(3);
    expect(screen.getByLabelText('Course unit')).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: 'Year 2' }));
    await user.click(screen.getByRole('radio', { name: 'Semester 1' }));
    expect(screen.getByLabelText('Course unit')).toBeEnabled();

    // Changing the university clears everything after it.
    await user.selectOptions(screen.getByLabelText('University'), '');
    expect(screen.getByLabelText('Course (programme)')).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Year 2' })).toHaveAttribute('aria-checked', 'false');
  });

  it('checks the optional contact and shows the sign-up nudge', async () => {
    const user = setup('guest');
    expect(screen.queryByText(/Earn points/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign up free' })).toHaveAttribute('href', '/signup');
    await user.type(screen.getByLabelText('Phone or email'), 'tomorrow');
    await user.click(screen.getByRole('button', { name: 'Send for review' }));
    expect(screen.getByText(/Enter an email or a phone number/)).toBeInTheDocument();
    expect(screen.getByText('Confirm you have the right to share this file.')).toBeInTheDocument();
  });

  it('lists a book on the reading list without a file', async () => {
    const user = setup('guest');
    await user.click(screen.getByRole('radio', { name: 'Book' }));
    expect(screen.getByRole('radio', { name: /No, list it as a resource/ })).toBeChecked();
    expect(screen.queryByLabelText(/Choose a file/)).not.toBeInTheDocument();

    const details = screen.getByRole('region', { name: 'Book details' });
    await user.type(
      within(details).getByLabelText('Title'),
      'Data Structures and Algorithms in Java',
    );
    await user.type(within(details).getByLabelText('Author(s)'), 'Goodrich and Tamassia');
    await user.type(within(details).getByLabelText('Edition and year'), '6th, 2014');
    await user.click(within(details).getByRole('button', { name: 'University library' }));
    await user.type(
      within(details).getByLabelText('Library and shelf number'),
      'Main Library, QA76',
    );

    const preview = screen.getByRole('article', { name: 'Reading list entry' });
    expect(preview).toHaveTextContent('Data Structures and Algorithms in Java');
    expect(preview).toHaveTextContent('Main Library, QA76');

    await screen.findByRole('option', { name: 'Makerere University' });
    await user.selectOptions(screen.getByLabelText('University'), 'sample');
    await screen.findByRole('option', { name: 'BSc Computer Science' });
    await user.selectOptions(screen.getByLabelText('Course (programme)'), 'bscs');
    await user.click(screen.getByRole('radio', { name: 'Year 2' }));
    await user.click(screen.getByRole('radio', { name: 'Semester 1' }));
    await screen.findByRole('option', { name: /CSC 2100/ });
    await user.selectOptions(screen.getByLabelText('Course unit'), 'csc-2100');

    await user.click(screen.getByRole('button', { name: 'Add to the reading list' }));
    const sent = await screen.findByRole('status');
    expect(
      within(sent).getByRole('heading', { name: 'Added to the reading list' }),
    ).toBeInTheDocument();
    expect(within(sent).getByText(/Reference: RL-G/)).toBeInTheDocument();
    expect(within(sent).getByRole('link', { name: 'Back to Campus Hand' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('treats a shareable book as an ordinary upload', async () => {
    const user = setup('guest');
    await user.click(screen.getByRole('radio', { name: 'Book' }));
    await user.click(screen.getByRole('radio', { name: /Yes, I can share it/ }));
    expect(screen.getByLabelText(/Choose a file/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send for review' })).toBeInTheDocument();
  });
});

describe('upload rail', () => {
  it('shows each upload’s status and the moderator’s note', async () => {
    render(
      <>
        <MyUploads uploads={await new PreviewUploadSource(0).myUploads()} />
        <SharingABook />
      </>,
    );
    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.getByText('In review')).toBeInTheDocument();
    expect(screen.getByText('Changes asked')).toBeInTheDocument();
    expect(screen.getByText(/Page 3 is blurry/)).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Sharing a book?' })).toBeInTheDocument();
  });

  it('says when there are no uploads yet', () => {
    render(<MyUploads uploads={[]} />);
    expect(screen.getByText(/Your first upload shows here/)).toBeInTheDocument();
  });
});
