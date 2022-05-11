import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import styles from "./home.module.scss";

interface Novel {
  name: string;
  author: string;
  introduce: string[];
  chapters: Chapter[];
  createdAt?: Date;
  modifiedAt?: Date;
}

interface Chapter {
  title: string;
  content: string[];
  createdAt?: Date;
  modifiedAt?: Date;
}

export default function Home() {
  const [novel, setNovel] = useState<Novel>();

  const searchRef = useRef<HTMLInputElement | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const [index, setIndex] = useState(0);

  const [show, setShow] = useState(false);

  const [menu, setMenu] = useState<"目录" | "缩回">("目录");

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      let page = searchRef.current?.valueAsNumber;
      if (typeof page !== "undefined") {
        setIndex(page);
      }
    }
  }

  // 上传文件
  function upload(e: React.ChangeEvent<HTMLInputElement>) {
    let file = e.target.files?.item(0) as File;

    if (file === null) {
      return;
    }

    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = () => {
      let formData = new FormData();
      formData.append("file", file);
      axios
        .post("/api/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          setNovel(res.data);
        });
    };
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") {
      setIndex((prev) => prev + 1);
    }

    if (e.key === "ArrowLeft") {
      setIndex((prev) => prev - 1);
    }
  }

  // 每次载入时绑定事件 卸载时解绑事件
  useEffect(() => {
    document.addEventListener("keydown", () => handleKeyDown, false);

    return () =>
      document.removeEventListener("keydown", () => handleKeyDown, false);
  }, []);

  // 每次载入小说时跳转到第一章
  useEffect(() => {
    if (typeof novel !== "undefined") {
      setIndex(0);
    }
  }, [novel]);

  // 每次更新章节时跳转到章节首部
  useEffect(() => {
    document.documentElement.scrollIntoView();
  }, [index]);

  // 每次更新章节或者点击目录时，使当前章节标题居于章节列表视图中间
  useEffect(() => {
    let node = menuRef.current?.children.item(index);

    if (typeof node === "undefined" || node === null) {
      return;
    }

    if (node instanceof HTMLParagraphElement) {
      node.scrollIntoView({ block: "center" });
    }
  }, [show, index]);

  return (
    <div className={styles.layout}>
      <input type="file" accept=".txt" onChange={upload} />
      <div className={styles.menu1}>
        <span
          onClick={() => {
            setShow(!show);
            setMenu(menu === "目录" ? "缩回" : "目录");
          }}
        >
          {menu}
        </span>
        <div
          className={styles.menu2}
          style={show ? { display: "block" } : { display: "none" }}
          ref={menuRef}
        >
          {novel?.chapters?.map((v, i) => {
            return (
              <p
                key={i}
                className={styles.item}
                style={index === i ? { color: "red" } : undefined}
                onClick={() => {
                  if (novel.chapters.length > 1) {
                    setIndex(i);
                  }
                }}
              >
                {v.title}
              </p>
            );
          })}
        </div>
      </div>
      <div className={styles.container}>
        <p>{novel?.chapters?.at(index)?.title}</p>
        {novel?.chapters?.at(index)?.content.map((c, i) => {
          return <p key={i}>{c}</p>;
        })}
      </div>
      <div className={styles.search}>
        <input type="number" ref={searchRef} onKeyDown={handleSearch} />
      </div>
      <button
        className={styles.left}
        onClick={() => setIndex((prev) => prev - 1)}
      >
        上一章
      </button>
      <button
        className={styles.right}
        onClick={() => setIndex((prev) => prev + 1)}
      >
        下一章
      </button>
    </div>
  );
}
