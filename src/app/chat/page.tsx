"use client";
import React, { useEffect, useRef, useState } from "react";
import { Card, CardBody, Textarea, Button } from "@nextui-org/react";
import { MessageProps } from "@/types";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message } from "postcss";
import { POST } from "../api/message/route";
import MarkdownRenderer from "@/components/MarkdownRenderer";

// Access your API key as an environment variable

const Page = () => {
  const [data, setData] = useState<MessageProps[]>([]);
  const [prompt, setPrompt] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollDown = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const constructPrompt = (message: MessageProps) => {
    return {
      role: message.type,
      parts: [{ text: message.message }],
    };
  };

  const getResponse = async (data: MessageProps[]) => {
    const transformedData = data.map((message) => constructPrompt(message));

    const formData = new FormData();
    formData.append("conversation_history", JSON.stringify(transformedData));

    const response = await fetch(
      process.env.NEXT_PUBLIC_SERVER_API + "/message",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) return null;

    const response_data = await response.json();
    const { result } = response_data;
    return result;
  };

  const handleResponse = async () => {
    const newPrompt: MessageProps = {
      type: "user",
      message: prompt,
    };

    setPrompt("");

    const newData = [...data, newPrompt];

    setData([...data, newPrompt]);

    getResponse(newData).then(async (res) => {
      if (res) {
        const result: MessageProps = {
          type: "model",
          message: res,
        };
        setData([...newData, result]);
      }
    });
  };

  useEffect(() => {
    scrollDown();
  }, [data]);

  return (
    <div className="h-full w-screen flex justify-center">
      <div className="flex-col m-5 p-2 rounded-lg justify-center w-5/6 overflow-clip relative">
        <div className="h-[calc(100vh-100px)] overflow-auto flex-col">
          {data.map((item, index) => (
            <div
              key={index}
              className={`flex ${
                item.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-2 mb-2 rounded-lg ${
                  item.type === "user" ? "w-1/2" : "w-full"
                }`}
              >
                <Card
                  className={`${
                    item.type === "user"
                      ? "bg-gray-200"
                      : "border-2 border-blue-300"
                  }`}
                  shadow="md"
                >
                  <CardBody>
                    {/* <p className="text-justify">{item.message}</p> */}
                    <MarkdownRenderer markdownText={item.message} />
                  </CardBody>
                </Card>
              </div>
            </div>
          ))}
          <div ref={bottomRef}></div>
          {/* <div className="flex justify-end">
            <div className="p-2 mb-2 rounded-lg text-justify w-1/2">
              <Card className="bg-gray-200" shadow="md">
                <CardBody>
                  <p>
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                    Dolorum aliquid earum magni animi dicta odit placeat, esse
                    veniam doloremque distinctio ducimus a cupiditate tenetur,
                    molestias in, fuga provident hic iste consequatur? Placeat,
                    nam, doloremque consequuntur officiis et, dolor obcaecati
                    doloribus ipsum in hic rem sit tempora earum est voluptate
                    laudantium.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
          <div className="justify-start flex">
            <div className="p-2 mb-2 rounded-lg text-justify items-center">
              <Card className="border-2 border-blue-300" shadow="md">
                <CardBody>
                  <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Non, exercitationem rerum. Esse illo cumque dolorem
                    veritatis quidem ut in nesciunt placeat blanditiis, omnis
                    repellendus odit numquam exercitationem officia
                    perspiciatis, modi iure suscipit similique laboriosam?
                    Facere aperiam, quia magni totam molestias nam dolore hic
                    sunt doloremque exercitationem eligendi doloribus aut
                    placeat nesciunt repellat ab saepe natus blanditiis nemo,
                    aspernatur dolorum. Voluptas obcaecati quasi quod natus sit
                    fuga optio veritatis, adipisci dolor distinctio impedit et
                    quaerat officia dolore inventore quis quas eum tempore
                    nihil! At officia saepe, amet voluptatum aliquid ab quaerat
                    eveniet similique, iure autem tempore impedit pariatur ipsum
                    distinctio doloremque aliquam consequatur totam mollitia
                    consectetur doloribus quam modi voluptatem veritatis. Velit
                    necessitatibus vero tempora, eum sequi eius beatae aut, ea
                    error molestiae fugiat, doloremque quas. Nesciunt provident
                    et explicabo commodi voluptatum repellendus dolore atque
                    praesentium error. Deserunt doloremque nihil id repellat,
                    eveniet beatae magni minima possimus accusantium autem
                    tempora nobis numquam nam, esse tenetur tempore enim quia
                    vel! Animi corporis nobis alias voluptate. Commodi nihil,
                    veritatis ut tempore laboriosam repudiandae aliquid placeat!
                    Illum dolorem, ipsa in doloribus illo mollitia adipisci
                    perferendis fuga numquam, impedit, quo nemo cupiditate.
                    Ratione deserunt, similique enim consectetur accusamus
                    dolorum numquam, ab quis, facilis voluptate nesciunt.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div> */}
        </div>
        <div className="flex absolute bottom-0 left-0 w-full p-2 bg-white border-t border-gray-300 justify-center">
          <Textarea
            minRows={1}
            maxRows={9}
            variant="bordered"
            labelPlacement="outside"
            placeholder="Enter your description"
            className="w-1/2 justify-center"
            value={prompt}
            onValueChange={setPrompt}
          />
          <Button
            className="ml-2"
            size="md"
            color="primary"
            onClick={async () => {
              await handleResponse();
            }}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
