import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import styles from "./home.module.scss";

interface Text {
  title: string;
  content: string[];
}

export default function Home() {
  const [list, setList] = useState<Text[]>([
    { title: "sss", content: ["sfsdf"] },
  ]);

  const searchRef = useRef<HTMLInputElement | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const [index, setIndex] = useState(0);

  const [show, setShow] = useState(false);

  const [menu, setMenu] = useState("目录");

  function nextPage() {
    setIndex((prev) => prev + 1);
    currentItem(true);
    document.body.scrollIntoView();
  }

  function prevPage() {
    setIndex((prev) => prev - 1);
    currentItem(false);
    document.body.scrollIntoView();
  }

  function currentPage(page: number) {
    setIndex(page);
    currentItem(true);
    document.body.scrollIntoView();
  }

  function currentItem(up: boolean) {
    let node = menuRef.current?.children.item(
      up ? index + 1 : index - 1
    ) as HTMLParagraphElement;
    node.scrollIntoView();
  }

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      let page = searchRef.current?.valueAsNumber;
      if (page && page <= list?.length) {
        currentPage(page);
      }

      console.log(searchRef.current?.value);
    }
  }

  function upload(e: React.ChangeEvent<HTMLInputElement>) {
    let file = e.target.files?.item(0) as File;
    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = () => {
      let formData = new FormData();
      formData.append("file", file);
      axios
        .post("http://localhost:8080/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          let data = res.data as Text[];
          setList(data);
        });
    };
  }

  useEffect(() => {
    document.onkeydown = (e) => {
      if (e.key === "ArrowRight") {
        nextPage();
      }

      if (e.key === "ArrowLeft") {
        prevPage();
      }
    };
  });

  return (
    <div className={styles.layout} tabIndex={0}>
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
        {show ? (
          <div className={styles.menu2} ref={menuRef}>
            {list?.map((v, i) => {
              return (
                <p
                  key={i}
                  className={
                    index === i
                      ? `${styles.item} ${styles.active}`
                      : `${styles.item}`
                  }
                  onClick={() => currentPage(i)}
                >
                  {v.title}
                </p>
              );
            })}
          </div>
        ) : undefined}
      </div>
      <div className={styles.container}>
        <p>{list?.at(index)?.title}</p>
        {list?.at(index)?.content.map((c, i) => {
          return <p key={i}>{c}</p>;
        })}
      </div>
      <div className={styles.search}>
        <input type="number" ref={searchRef} onKeyDown={handleSearch} />
      </div>
      <button className={styles.left} onClick={prevPage}>
        prev
      </button>
      <button className={styles.right} onClick={nextPage}>
        next
      </button>
    </div>
  );
}
