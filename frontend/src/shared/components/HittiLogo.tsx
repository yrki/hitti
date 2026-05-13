import styles from './HittiLogo.module.css';

interface Props {
  size?: 'small' | 'large';
  className?: string;
}

const ASCII = String.raw`  _  _ _ _   _   _
 | || (_) |_| |_(_)
 | __ | |  _|  _| |
 |_||_|_|\__|\__|_|`;

export function HittiLogo({ size = 'large', className }: Props) {
  const sizeClass = size === 'small' ? styles.small : styles.large;
  const combined = [styles.logo, sizeClass, className].filter(Boolean).join(' ');

  return (
    <pre aria-label="Hitti" className={combined}>
      {ASCII}
    </pre>
  );
}
