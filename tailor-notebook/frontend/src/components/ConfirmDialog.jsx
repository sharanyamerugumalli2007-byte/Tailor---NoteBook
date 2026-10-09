import Modal from './Modal';

export default function ConfirmDialog({ title, message, confirmText = 'Confirm', danger, busy, onConfirm, onCancel }) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button className="btn" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmText}
          </button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}
