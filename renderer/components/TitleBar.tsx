const TitleBar = () => {
  return (
    <div className="titlebar bg-accent">
      <div className="titlebar-drag ">Kylie's Note App</div>
      <style jsx>{`
        .titlebar {
          height: 28px;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 10px;
          -webkit-app-region: drag;
          user-select: none;
        }

        .titlebar-drag {
          font-size: 12px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default TitleBar; 