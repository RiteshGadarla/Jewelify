import torch
from diffusers import StableDiffusionInstructPix2PixPipeline, EulerAncestralDiscreteScheduler
from PIL import Image

model_id = "timbrooks/instruct-pix2pix"
device = "cuda" if torch.cuda.is_available() else "cpu"

pipe = StableDiffusionInstructPix2PixPipeline.from_pretrained(
    model_id,
    safety_checker=None,
    torch_dtype=torch.float32 if device == "cpu" else torch.float16
)
pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
pipe = pipe.to(device)

print("🚀 Instruct pix2pix loaded")


def generate_image(image_path: str, output_path: str, prompt_id: int):
    prompts = {
        1: "Enhance this sketch into a hyper-realistic diamond necklace while strictly preserving every element of the original design. Add a radiant shine to the diamonds, refine intricate details, and emphasize the luxury of the piece with a polished and realistic finish. Ensure that diamonds are placed only where indicated in the sketch, without altering their size or placement.",
        2: "Transform this sketch into a lifelike jewelry piece featuring vibrant rubies, gemstones, and precious stones. Keep the exact design and arrangement of elements intact. Ensure gemstones are applied only where required and as per the sketch, maintaining appropriate sizes and avoiding excessive placement. Focus on enriching the colors and textures of the stones while polishing the final look.",
        3: "Convert this sketch into an ultra-realistic platinum jewelry piece, ensuring that the original design is completely preserved. Highlight the smooth, reflective surface of platinum with precise detailing and subtle light reflections. If gemstones are present, ensure they are applied sparingly, only where indicated in the sketch, and maintain their size and arrangement accurately."
    }

    # Validate prompt_id
    if prompt_id not in prompts:
        raise ValueError("Invalid prompt_id. Please use 1, 2, or 3.")

    image = Image.open(image_path).convert("RGB")
    image = image.resize((512, 512), Image.Resampling.LANCZOS)

    # Step 4: Generate the image
    num_inference_steps = 10
    guidance_scale = 7.5
    prompt = prompts[prompt_id]

    print(f"Processing with prompt: {prompt}")
    with torch.inference_mode():
        result = pipe(
            prompt=prompt,
            image=image,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale
        )

    # Step 5: Save the output image
    output_image = result.images[0]
    output_image.save(output_path)
    print(f"Generated image saved to: {output_path}")


# Example usage
if __name__ == "__main__":
    input_image_path = r"C:\Users\rites\OneDrive\Desktop\testImages2\sample3.jpg"
    output_image_path = r"C:\Users\rites\OneDrive\Desktop\testImages2\output_sample3.jpg"
    prompt_id = 1  # Choose 1, 2, or 3 for predefined prompts
    generate_image(input_image_path, output_image_path, prompt_id)
