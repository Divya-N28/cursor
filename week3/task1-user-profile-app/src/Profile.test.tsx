import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Profile from './Profile';

describe('Profile Page (single edit/submit)', () => {
  test('renders profile with avatar, name, email, and phone', () => {
    render(<Profile />);
    expect(screen.getByText('A')).toBeInTheDocument(); // Avatar from first letter
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1 234 567 8901')).toBeInTheDocument();
  });

  test('shows a single Edit button', () => {
    render(<Profile />);
    expect(screen.getByTestId('edit-profile')).toBeInTheDocument();
    expect(screen.queryByTestId('submit-profile')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cancel-profile')).not.toBeInTheDocument();
  });

  test('shows Submit and Cancel buttons in edit mode', () => {
    render(<Profile />);
    fireEvent.click(screen.getByTestId('edit-profile'));
    expect(screen.getByTestId('submit-profile')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-profile')).toBeInTheDocument();
    expect(screen.queryByTestId('edit-profile')).not.toBeInTheDocument();
  });

  test('can edit all fields and submit', () => {
    render(<Profile />);
    fireEvent.click(screen.getByTestId('edit-profile'));
    fireEvent.change(screen.getByDisplayValue('Alice Smith'), { target: { value: 'Bob Johnson' } });
    fireEvent.change(screen.getByDisplayValue('alice@example.com'), { target: { value: 'bob@example.com' } });
    fireEvent.change(screen.getByDisplayValue('+1 234 567 8901'), { target: { value: '+1 987 654 3210' } });
    fireEvent.click(screen.getByTestId('submit-profile'));
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1 987 654 3210')).toBeInTheDocument();
  });

  test('cancel discards changes', () => {
    render(<Profile />);
    fireEvent.click(screen.getByTestId('edit-profile'));
    fireEvent.change(screen.getByDisplayValue('Alice Smith'), { target: { value: 'Bob Johnson' } });
    fireEvent.change(screen.getByDisplayValue('alice@example.com'), { target: { value: 'bob@example.com' } });
    fireEvent.change(screen.getByDisplayValue('+1 234 567 8901'), { target: { value: '+1 987 654 3210' } });
    fireEvent.click(screen.getByTestId('cancel-profile'));
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1 234 567 8901')).toBeInTheDocument();
  });

  test('avatar updates to first letter of new name after submit', () => {
    render(<Profile />);
    fireEvent.click(screen.getByTestId('edit-profile'));
    fireEvent.change(screen.getByDisplayValue('Alice Smith'), { target: { value: 'Bob Johnson' } });
    fireEvent.click(screen.getByTestId('submit-profile'));
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  test('shows camera icon in edit mode and allows uploading avatar image', async () => {
    render(<Profile />);
    fireEvent.click(screen.getByTestId('edit-profile'));
    // Camera icon should be visible
    const cameraIcon = screen.getByTitle('Change profile picture');
    expect(cameraIcon).toBeInTheDocument();
    // Simulate file upload
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const fileInput = cameraIcon.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    fireEvent.change(fileInput!, { target: { files: [file] } });
    // After upload, avatar image should be present
    // Wait for the image to appear (FileReader is async)
    const img = await screen.findByAltText('avatar');
    expect(img).toBeInTheDocument();
  });

  test('cancel after changing fields reverts to original values', () => {
    render(<Profile />);
    fireEvent.click(screen.getByTestId('edit-profile'));
    fireEvent.change(screen.getByDisplayValue('Alice Smith'), { target: { value: 'Changed Name' } });
    fireEvent.change(screen.getByDisplayValue('alice@example.com'), { target: { value: 'changed@example.com' } });
    fireEvent.click(screen.getByTestId('cancel-profile'));
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  test('submit with no changes keeps values the same', () => {
    render(<Profile />);
    fireEvent.click(screen.getByTestId('edit-profile'));
    fireEvent.click(screen.getByTestId('submit-profile'));
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1 234 567 8901')).toBeInTheDocument();
  });

  test('edit only one field and submit', () => {
    render(<Profile />);
    fireEvent.click(screen.getByTestId('edit-profile'));
    fireEvent.change(screen.getByDisplayValue('Alice Smith'), { target: { value: 'Only Name Changed' } });
    fireEvent.click(screen.getByTestId('submit-profile'));
    expect(screen.getByText('Only Name Changed')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1 234 567 8901')).toBeInTheDocument();
  });

  test('uploading a non-image file does not crash', () => {
    render(<Profile />);
    fireEvent.click(screen.getByTestId('edit-profile'));
    const cameraIcon = screen.getByTitle('Change profile picture');
    const fileInput = cameraIcon.querySelector('input[type="file"]');
    const file = new File(['not-an-image'], 'file.txt', { type: 'text/plain' });
    fireEvent.change(fileInput!, { target: { files: [file] } });
    // Should still show the avatar letter
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  test('clicking camera icon in view mode does nothing', () => {
    render(<Profile />);
    // Camera icon should not be present in view mode
    expect(screen.queryByTitle('Change profile picture')).not.toBeInTheDocument();
  });

  test('handles empty name, email, and phone gracefully', () => {
    const { container } = render(<Profile />);
    fireEvent.click(screen.getByTestId('edit-profile'));
    fireEvent.change(screen.getByDisplayValue('Alice Smith'), { target: { value: '' } });
    fireEvent.change(screen.getByDisplayValue('alice@example.com'), { target: { value: '' } });
    fireEvent.change(screen.getByDisplayValue('+1 234 567 8901'), { target: { value: '' } });
    fireEvent.click(screen.getByTestId('submit-profile'));
    // Check that the value containers for name, email, and phone are empty
    const valueDivs = container.querySelectorAll('div[style*="text-align: left"], div[style*="text-align: center"]');
    // The first is name, the second is email, the third is phone
    expect(valueDivs[0].textContent).toBe('');
    expect(valueDivs[1].textContent).toBe('');
    expect(valueDivs[2].textContent).toBe('');
  });

  test('handleFileChange does nothing if no file is selected', () => {
    render(<Profile />);
    fireEvent.click(screen.getByTestId('edit-profile'));
    const cameraIcon = screen.getByTitle('Change profile picture');
    const fileInput = cameraIcon.querySelector('input[type="file"]');
    // Simulate change event with no files
    fireEvent.change(fileInput!, { target: { files: [] } });
    // Avatar should still be the letter
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  test('handleFileChange triggers FileReader onload and updates avatar', async () => {
    // Mock FileReader
    const originalFileReader = window.FileReader;
    let onLoadCallback: ((ev: any) => void) | undefined;
    window.FileReader = class {
      readAsDataURL() {
        setTimeout(() => {
          if (onLoadCallback) {
            onLoadCallback({ target: { result: 'data:image/png;base64,MOCK' } });
          }
        }, 0);
      }
      set onload(cb) {
        onLoadCallback = cb;
      }
      get onload() {
        return onLoadCallback;
      }
    } as any;

    render(<Profile />);
    fireEvent.click(screen.getByTestId('edit-profile'));
    const cameraIcon = screen.getByTitle('Change profile picture');
    const fileInput = cameraIcon.querySelector('input[type="file"]');
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    fireEvent.change(fileInput!, { target: { files: [file] } });

    // Wait for the avatar image to appear
    const img = await screen.findByAltText('avatar');
    expect(img).toBeInTheDocument();

    // Restore FileReader
    window.FileReader = originalFileReader;
  });
}); 