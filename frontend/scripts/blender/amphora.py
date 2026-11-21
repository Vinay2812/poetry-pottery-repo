# Renders public/home/amphora.webp source: blender -b --factory-startup -P scripts/blender/amphora.py -- <abs_out.png> 1600 <samples>
import argparse
import math
import sys

import bpy
import numpy as np
from numpy.typing import NDArray
from mathutils import Vector

HEIGHT = 3.26
SEGMENTS = 960
TAU = math.tau
BELLY_TRACKS = 64

# The last points roll over the rim into the inner wall.
PROFILE = [
    (0.000, .017), (.410, .017), (.500, .014), (.541, .005),
    (.563, .008), (.582, .035), (.583, .070), (.576, .111),
    (.557, .156), (.550, .210), (.553, .285), (.576, .410),
    (.610, .550), (.652, .675), (.715, .799), (.810, .962),
    (.883, 1.147), (.921, 1.326), (.931, 1.535), (.920, 1.740),
    (.888, 1.946), (.839, 2.141), (.777, 2.322), (.704, 2.493),
    (.618, 2.650), (.512, 2.793), (.480, 2.912), (.450, 3.004),
    (.451, 3.072), (.470, 3.128), (.500, 3.172), (.512, 3.208),
    (.500, 3.244), (.467, HEIGHT), (.430, 3.249), (.408, 3.215),
    (.397, 3.167), (.382, 3.098), (.377, 3.017), (.393, 2.928),
    (.441, 2.800), (.548, 2.660), (.630, 2.500), (.704, 2.324),
    (.768, 2.139), (.814, 1.947), (.842, 1.742), (.849, 1.537),
    (.837, 1.339), (.800, 1.155), (.731, .974), (.638, .810),
    (.558, .690), (.505, .564), (.479, .432), (.432, .320),
    (.355, .257), (.245, .230), (0.0, .229),
]
OUTSIDE_COUNT = 34

# Each entry pairs an outer wall radius with its height.
BODY_PROFILE = (
    (.557, .156), (.588, .210), (.592, .285), (.616, .410),
    (.640, .550), (.690, .675), (.745, .800), (.800, .962),
    (.850, 1.147), (.888, 1.340), (.915, 1.540), (.930, 1.740),
    (.928, 1.946), (.905, 2.141), (.858, 2.322), (.785, 2.493),
    (.672, 2.650), (.565, 2.793), (.480, 2.912),
)
BODY_START = 8

SCROLL = (
    ((-.510, .227), (-.335, .198), (-.145, .263), (-.064, .414)),
    ((-.064, .414), (.044, .605), (.295, .647), (.365, .486)),
    ((.365, .486), (.425, .339), (.235, .260), (.126, .324)),
    ((.126, .324), (.061, .361), (.084, .428), (.165, .441)),
)
SCROLL_EDGE = (
    ((-.190, .316), (-.130, .377), (-.120, .476), (.013, .529)),
    ((.013, .529), (.125, .616), (.307, .645), (.379, .550)),
)


def main():
    args = read_render_arguments()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    clay = create_clay()
    pottery = bpy.data.collections.new("Pottery")
    scene.collection.children.link(pottery)
    create_vessel(pottery, clay)
    create_handle(pottery, clay, -1)
    create_handle(pottery, clay, 1)
    create_studio(scene)
    render(scene, args)


def read_render_arguments():
    parser = argparse.ArgumentParser()
    parser.add_argument("output")
    parser.add_argument("resolution", type=int)
    parser.add_argument("samples", type=int)
    args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:])
    if args.resolution < 1 or args.samples < 1:
        parser.error("Resolution and samples must be positive.")
    return args


def interpolate_profile(points, spacing):
    points = np.array(points, dtype=float)
    padded = np.concatenate((points[:1], points, points[-1:]))
    for first, start, end, last in zip(padded, padded[1:], padded[2:], padded[3:]):
        steps = max(2, math.ceil(np.linalg.norm(end[:2] - start[:2]) / spacing))
        t = np.arange(steps)[:, None] / steps
        yield from .5 * (
            2 * start + (end - first) * t
            + (2 * first - 5 * start + 4 * end - last) * t**2
            + (-first + 3 * start - 3 * end + last) * t**3
        )
    yield points[-1]


def eased(start, end, value):
    t = np.clip((value - start) / (end - start), 0, 1)
    return t * t * (3 - 2 * t)


def carve_belly(theta, z):
    swing = .16 * np.sin(5 * theta + 3.4 * z) + .10 * np.sin(11 * theta - 5.5 * z)
    drift = .11 * np.sin(20 * theta + 10.1 * z) + .05 * np.sin(38 * theta - 13 * z)
    sweep = 2.35 * (z - 1.65)**2 + .35 * np.sin(7 * theta + 2.6 * z)
    phase = (BELLY_TRACKS * theta - 51 * z + sweep + swing + drift) / TAU
    track = np.floor(phase + .5)
    track_angle = TAU * track / BELLY_TRACKS
    offset = phase - track
    offset += .028 * np.sin(23 * track_angle + .35)
    offset += .014 * np.sin(21 * track_angle + 27 * z) + .014 * np.sin(17 * track_angle - 14 * z)
    width = .225 + .048 * np.sin(27 * track_angle + .68) + .035 * np.sin(9 * track_angle + 8.2 * z)
    pressure = (
        .82 + .18 * np.sin(15 * track_angle + 5.4 * z)
        + .15 * np.sin(9 * track_angle - 12.1 * z)
        + .11 * np.cos(27 * track_angle + 19 * z)
    )
    height = band_height(theta, z)
    upper_end = 2.63 + .055 * np.sin(8 * track_angle + 1) + .043 * np.sin(17 * track_angle - 1)
    lower_end = .798 + .021 * np.sin(16 * track_angle - .2)
    fade = eased(lower_end, lower_end + .085, height) * (1 - eased(upper_end - .32, upper_end, z))
    cut = np.exp(-(offset / (width + .13 * offset))**2)
    shoulder = np.exp(-((offset - .29) / .17)**2)
    scrape = np.exp(-((offset + .23) / .108)**2)
    scrape_pressure = eased(.14, .86, np.sin(19 * track_angle + 22 * z))
    return fade * pressure * (-.0082 * cut + .0022 * shoulder - .0041 * scrape_pressure * scrape)


def band_height(theta: NDArray[np.float64], z: float) -> NDArray[np.float64]:
    return z - .013 * np.sin(3 * theta - .2) - .006 * np.sin(11 * theta)


def carve_scroll_band(theta, z):
    local_height = band_height(theta, z)
    cell = (theta + math.pi / 2) * 6 / TAU + .44
    cell += .024 * np.sin(6 * theta)
    local_angle = cell - np.floor(cell + .5)

    def carve_path(path, width, depth):
        distance = np.full(theta.shape, np.inf)
        for first, control_one, control_two, last in path:
            for t in np.linspace(0, 1, 37):
                s = 1 - t
                u, h = [
                    s**3 * p + 3 * s**2 * t * q + 3 * s * t**2 * r + t**3 * v
                    for p, q, r, v in zip(first, control_one, control_two, last)
                ]
                delta = (local_angle - u + .5) % 1 - .5
                scroll_height = .185 + 1.4 * (h - .185)
                distance = np.minimum(distance, (.69 * delta)**2 + (local_height - scroll_height)**2)
        return -depth * np.exp(-distance / width**2)

    pressure = .78 + .16 * np.sin(7 * theta + 16 * z) + .10 * np.cos(17 * theta - 46 * z)
    scroll = carve_path(SCROLL, .029, .045)
    edge = carve_path(SCROLL_EDGE, .017, .018)
    upper_rim = -.0068 * np.exp(-((local_height - .809) / .016)**2)
    return pressure * np.minimum(scroll, edge) + upper_rim


def press_foot(theta, z):
    travel = (z - .028) / .110
    phase = 30 * theta / TAU - .20 * travel + .040 * np.sin(9 * theta) + .029 * np.sin(17 * theta + .5)
    offset = phase - np.floor(phase + .5)
    arch = .21 + 5.8 * offset**2
    distance = (travel - arch) / np.sqrt(1 + (11.6 * offset)**2)
    scallop = np.exp(-(distance / .105)**2) * (1 - eased(.30, .45, np.abs(offset)))
    stamp = eased(0, .18, travel) * (1 - eased(.74, 1, travel))
    pressure = .82 + .13 * np.sin(8 * theta) + .10 * np.cos(13 * theta)
    return -.024 * stamp * scallop * pressure


def vessel_profiles():
    body_end = BODY_START + len(BODY_PROFILE)
    original_body = PROFILE[BODY_START - 1:body_end + 1]
    shaped_body = [original_body[0], *BODY_PROFILE, original_body[-1]]
    original_samples = np.array(list(interpolate_profile(original_body, .004)))
    shaped_samples = np.array(list(interpolate_profile(shaped_body, .004)))
    outside = PROFILE[:BODY_START] + list(BODY_PROFILE) + PROFILE[body_end:OUTSIDE_COUNT]
    outer = list(interpolate_profile(outside, .007))
    inner = []
    for radius, z in list(interpolate_profile(PROFILE[OUTSIDE_COUNT - 1:], .011))[1:]:
        if radius and original_body[0][1] < z < original_body[-1][1]:
            old_radius = np.interp(z, original_samples[:, 1], original_samples[:, 0])
            new_radius = np.interp(z, shaped_samples[:, 1], shaped_samples[:, 0])
            radius += new_radius - old_radius
        inner.append((radius, z))
    return outer, inner


def create_vessel(collection, clay):
    theta = np.linspace(0, TAU, SEGMENTS, endpoint=False)
    vertices = []
    rings = []
    outer, inner = vessel_profiles()
    for row, (radius, z) in enumerate(outer + inner):
        if radius == 0:
            rings.append([len(vertices)])
            vertices.append((0, 0, z))
            continue

        outside = row < len(outer)
        hand_shape = (
            .010 * np.sin(2 * theta + .65 + .61 * z)
            + .011 * np.sin(3 * theta - .80 * z)
            + .006 * np.sin(5 * theta + .9 * z)
        )
        on_floor = eased(.012, .055, z)
        rim = eased(3.04, 3.24, z)
        radius_at_angle = radius * (1 + hand_shape * (1 - .60 * rim))
        lip_edge = eased(3.12, 3.24, z)
        radius_at_angle += lip_edge * (.007 * np.sin(4 * theta + 1) + .0035 * np.sin(7 * theta))
        z_at_angle = (
            z
            + on_floor * (.007 * np.sin(3 * theta + 2.3 * z) + .005 * np.sin(7 * theta - z))
            + rim * (.013 * np.sin(3 * theta + .65) + .006 * np.sin(5 * theta + .2)
                     + .0035 * np.sin(8 * theta - .75))
        )
        if outside:
            if .76 < z < 2.73:
                radius_at_angle += carve_belly(theta, z)
            if .14 < z < .91:
                radius_at_angle += carve_scroll_band(theta, z)
            if .028 < z < .138:
                radius_at_angle += press_foot(theta, z)
            neck_smoothing = 1 - .76 * eased(2.57, 3.12, z)
            radius_at_angle += on_floor * neck_smoothing * (
                .0027 * np.sin(18 * theta - 24 * z) * np.sin(7 * theta + 16 * z)
                + .0022 * np.sin(31 * theta + 9 * z) * np.sin(16 * theta - 23 * z)
            )

        rings.append(list(range(len(vertices), len(vertices) + SEGMENTS)))
        vertices.extend(zip(radius_at_angle * np.cos(theta), radius_at_angle * np.sin(theta), z_at_angle))

    faces = []
    for lower, upper in zip(rings, rings[1:]):
        for current in range(SEGMENTS):
            following = (current + 1) % SEGMENTS
            if len(lower) == 1:
                faces.append((lower[0], upper[following], upper[current]))
            elif len(upper) == 1:
                faces.append((lower[current], lower[following], upper[0]))
            else:
                faces.append((lower[current], lower[following], upper[following], upper[current]))
    return create_mesh(collection, "Thrown amphora", vertices, faces, clay)


def create_handle(collection, clay, side):
    if side < 0:
        profile = [
            (.344, 2.957, -.014, .117, .115), (.498, 3.020, -.028, .110, .101),
            (.674, 3.043, -.028, .098, .096), (.829, 2.975, -.049, .090, .093),
            (.896, 2.851, -.066, .086, .092), (.873, 2.732, -.074, .094, .097),
            (.763, 2.643, -.080, .112, .112), (.583, 2.561, -.067, .126, .115),
        ]
    else:
        profile = [
            (.355, 2.975, .016, .111, .108), (.490, 3.050, .019, .108, .101),
            (.666, 3.074, .009, .094, .091), (.828, 3.004, .001, .089, .092),
            (.909, 2.891, -.006, .090, .096), (.893, 2.763, -.027, .095, .098),
            (.773, 2.653, -.043, .112, .108), (.590, 2.577, -.039, .128, .116),
        ]
    sweep = list(interpolate_profile(profile, .014))
    section_count = 56
    vertices = []
    for row, (x, z, y, width, thickness) in enumerate(sweep):
        start = sweep[max(row - 1, 0)]
        end = sweep[min(row + 1, len(sweep) - 1)]
        tangent = Vector((side * (end[0] - start[0]), end[2] - start[2], end[1] - start[1])).normalized()
        normal = Vector((0, -1, 0)).cross(tangent).normalized()
        front = tangent.cross(normal).normalized()
        for section in range(section_count):
            angle = TAU * section / section_count
            across = math.cos(angle)
            toward = math.sin(angle)
            thumb_track = .011 * math.exp(-((across - .16) / .29)**2) * max(0, toward)**2
            uneven = 1 + .032 * math.sin(3 * angle + z * 10) + .023 * math.sin(7 * angle - z * 7)
            point = Vector((side * x, y, z - (.048 if side < 0 else .016)))
            point += normal * (across * width * uneven)
            point += front * ((toward * thickness - thumb_track) * uneven)
            vertices.append(tuple(point))

    faces = [tuple(range(section_count - 1, -1, -1))]
    for row in range(len(sweep) - 1):
        for current in range(section_count):
            following = (current + 1) % section_count
            bottom = row * section_count
            top = bottom + section_count
            faces.append((bottom + current, bottom + following, top + following, top + current))
    final_ring = (len(sweep) - 1) * section_count
    faces.append(tuple(range(final_ring, final_ring + section_count)))
    return create_mesh(collection, f"Hand-pulled handle {side:+}", vertices, faces, clay)


def create_mesh(collection, name, vertices, faces, material):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces, shade_flat=False)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    mesh.materials.append(material)
    return obj


def create_clay():
    clay = bpy.data.materials.new("Warm greige clay")
    nodes = clay.node_tree.nodes
    links = clay.node_tree.links
    shader = nodes["Principled BSDF"]
    shader.inputs["Roughness"].default_value = .86
    shader.inputs["Specular IOR Level"].default_value = .25
    coordinates = nodes.new("ShaderNodeTexCoord").outputs["Object"]

    broad = nodes.new("ShaderNodeTexNoise")
    broad.inputs["Scale"].default_value = 5.2
    broad.inputs["Detail"].default_value = 4
    links.new(coordinates, broad.inputs["Vector"])
    grain = nodes.new("ShaderNodeTexNoise")
    grain.inputs["Scale"].default_value = 139
    grain.inputs["Detail"].default_value = 2.5
    links.new(coordinates, grain.inputs["Vector"])

    blend = nodes.new("ShaderNodeMixRGB")
    blend.blend_type = "MIX"
    blend.inputs[0].default_value = .22
    links.new(broad.outputs["Fac"], blend.inputs[1])
    links.new(grain.outputs["Fac"], blend.inputs[2])
    tone = nodes.new("ShaderNodeValToRGB")
    low, high = tone.color_ramp.elements
    low.position, low.color = .30, (.396, .349, .285, 1)
    high.position, high.color = .70, (.555, .484, .401, 1)
    links.new(blend.outputs[0], tone.inputs["Fac"])
    links.new(tone.outputs["Color"], shader.inputs["Base Color"])

    pores = nodes.new("ShaderNodeBump")
    pores.inputs["Strength"].default_value = .36
    pores.inputs["Distance"].default_value = .0065
    links.new(grain.outputs["Fac"], pores.inputs["Height"])

    streak_space = nodes.new("ShaderNodeVectorMath")
    streak_space.operation = "MULTIPLY"
    streak_space.inputs[1].default_value = (1.1, 1.1, 3.0)
    links.new(coordinates, streak_space.inputs[0])
    streaks = nodes.new("ShaderNodeTexNoise")
    streaks.inputs["Scale"].default_value = 17
    streaks.inputs["Detail"].default_value = 3
    links.new(streak_space.outputs["Vector"], streaks.inputs["Vector"])
    tool_marks = nodes.new("ShaderNodeBump")
    tool_marks.inputs["Strength"].default_value = .30
    tool_marks.inputs["Distance"].default_value = .013
    links.new(streaks.outputs["Fac"], tool_marks.inputs["Height"])
    links.new(pores.outputs["Normal"], tool_marks.inputs["Normal"])
    links.new(tool_marks.outputs["Normal"], shader.inputs["Normal"])
    return clay


def point_at(obj, coordinates):
    direction = Vector(coordinates) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def create_area_light(collection, name, location, energy, size, target):
    data = bpy.data.lights.new(name, "AREA")
    data.energy = energy
    data.shape = "DISK"
    data.size = size
    light = bpy.data.objects.new(name, data)
    collection.objects.link(light)
    light.location = location
    point_at(light, target)


def create_contact_floor():
    bpy.ops.mesh.primitive_plane_add(size=3.2, location=(0, 0, .003))
    floor = bpy.context.object
    floor.name = "Contact shadow"
    floor.visible_diffuse = False
    floor.visible_glossy = False
    floor.visible_transmission = False
    floor.visible_shadow = False

    shadow = bpy.data.materials.new("Contact shadow")
    floor.data.materials.append(shadow)
    nodes = shadow.node_tree.nodes
    links = shadow.node_tree.links

    occlusion = nodes.new("ShaderNodeAmbientOcclusion")
    occlusion.samples = 16
    occlusion.inputs["Distance"].default_value = .43
    position = nodes.new("ShaderNodeSeparateXYZ")
    world_position = nodes.new("ShaderNodeNewGeometry").outputs["Position"]
    links.new(world_position, position.inputs[0])
    direction = nodes.new("ShaderNodeMapRange")
    direction.inputs["From Min"].default_value = -.65
    direction.inputs["From Max"].default_value = .65
    direction.inputs["To Min"].default_value = .435
    direction.inputs["To Max"].default_value = .60
    links.new(position.outputs["X"], direction.inputs["Value"])

    alpha = nodes.new("ShaderNodeMath")
    alpha.operation = "MULTIPLY"
    invert = nodes.new("ShaderNodeMath")
    invert.operation = "SUBTRACT"
    invert.inputs[0].default_value = 1.0
    links.new(occlusion.outputs["AO"], invert.inputs[1])
    links.new(invert.outputs[0], alpha.inputs[0])
    links.new(direction.outputs["Result"], alpha.inputs[1])

    horizontal = nodes.new("ShaderNodeVectorMath")
    horizontal.operation = "DOT_PRODUCT"
    horizontal.inputs[1].default_value = (.998, .059, 0)
    links.new(world_position, horizontal.inputs[0])
    distance = nodes.new("ShaderNodeMath")
    distance.operation = "ABSOLUTE"
    links.new(horizontal.outputs["Value"], distance.inputs[0])
    falloff = nodes.new("ShaderNodeMapRange")
    falloff.interpolation_type = "SMOOTHERSTEP"
    falloff.inputs["From Min"].default_value = .527
    falloff.inputs["From Max"].default_value = .719
    falloff.inputs["To Min"].default_value = 1
    falloff.inputs["To Max"].default_value = 0
    links.new(distance.outputs[0], falloff.inputs["Value"])
    contact = nodes.new("ShaderNodeMath")
    contact.operation = "MULTIPLY"
    links.new(alpha.outputs[0], contact.inputs[0])
    links.new(falloff.outputs["Result"], contact.inputs[1])

    transparent = nodes.new("ShaderNodeBsdfTransparent")
    shade = nodes.new("ShaderNodeEmission")
    shade.inputs["Color"].default_value = (.020, .017, .014, 1)
    mix = nodes.new("ShaderNodeMixShader")
    links.new(contact.outputs[0], mix.inputs[0])
    links.new(transparent.outputs[0], mix.inputs[1])
    links.new(shade.outputs[0], mix.inputs[2])
    links.new(mix.outputs[0], nodes["Material Output"].inputs["Surface"])


def create_studio(scene):
    create_contact_floor()
    lights = scene.collection
    create_area_light(lights, "Upper left softbox", (-4.1, -4.3, 6.3), 1170, 4.4, (0, 0, 1.6))
    create_area_light(lights, "Front bounce", (3.9, -5.0, 4.2), 65, 5.0, (0, 0, 1.45))
    create_area_light(lights, "Shoulder light", (2.7, 3.5, 5.5), 180, 4.6, (0, 0, 1.95))
    world = bpy.data.worlds.new("Studio ambient")
    ambient = world.node_tree.nodes["Background"]
    ambient.inputs["Color"].default_value = (1, .98, .95, 1)
    ambient.inputs["Strength"].default_value = .32
    scene.world = world

    camera_data = bpy.data.cameras.new("Hero camera")
    camera_data.type = "ORTHO"
    camera_data.ortho_scale = 4.31
    camera = bpy.data.objects.new("Hero camera", camera_data)
    scene.collection.objects.link(camera)
    camera.location = (.72, -12, 4.41)
    point_at(camera, (.015, 0, 1.63))
    scene.camera = camera


def render(scene, args):
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = args.samples
    scene.cycles.adaptive_threshold = .014
    scene.cycles.use_denoising = True
    scene.render.film_transparent = True
    scene.render.resolution_x = scene.render.resolution_y = args.resolution
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.exposure = .39
    scene.render.filepath = args.output
    bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    main()
