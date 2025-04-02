const TitleBar = () => {
  return (
    <div className="titlebar">
      <div className="titlebar-drag">Kylie Desktop App</div>
      <style jsx>{`
        .titlebar {
          height: 28px;
          background: transparent;
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