'use dom';

export default function DOMComponent({}: {dom: import('expo/dom').DOMProps}) {
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'red',
      }}>
      <h1 style={{color: 'black', fontSize: 72}}>Web</h1>
    </div>
  );
}
